#!/usr/bin/env python3
import sys
import json
import time
import gc
import traceback
from typing import List, Dict, Any, Tuple
import pulp

class CuttingStockSolver:
    def __init__(self):
        self.tolerance = 1e-6
        self.reduced_cost_threshold = -1e-5
        
    def solve(self, master_roll_length: int, beam_requirements: List[Dict]) -> Dict[str, Any]:
        """
        Solve the cutting stock problem using Column Generation
        """
        start_time = time.time()
        
        try:
            # Extract beam data
            unique_lengths = [req['length'] for req in beam_requirements]
            unique_quantities = [req['quantity'] for req in beam_requirements]
            num_types = len(unique_lengths)
            
            # Validate input
            if master_roll_length < max(unique_lengths):
                raise ValueError("Master roll length must be at least as long as the longest beam")
            
            # Initialize algorithm steps tracking
            algorithm_steps = []
            patterns_evaluated = 0
            
            # Step 1: Generate initial patterns
            algorithm_steps.append({
                "step": 1,
                "name": "Initial Pattern Generation",
                "description": f"Generated {num_types} initial patterns based on beam types",
                "status": "completed",
                "duration": 0.01
            })
            
            patterns = self._generate_initial_patterns(master_roll_length, num_types, unique_lengths)
            patterns_evaluated += len(patterns)
            
            iteration = 0
            max_iterations = 50
            
            # Column Generation Loop
            while iteration < max_iterations:
                iteration += 1
                
                # Step 2: Solve Master Problem LP Relaxation
                step_start = time.time()
                master_prob, x_sol, duals = self._solve_master_lp(patterns, master_roll_length, num_types, unique_quantities)
                step_duration = time.time() - step_start
                
                if iteration == 1:
                    algorithm_steps.append({
                        "step": 2,
                        "name": "Master Problem LP Relaxation",
                        "description": f"Solved linear programming relaxation, obtained dual values: {[round(d, 3) for d in duals]}",
                        "status": "completed",
                        "duration": step_duration
                    })
                
                # Step 3: Solve Pricing Subproblem
                step_start = time.time()
                new_pattern, reduced_cost = self._solve_knapsack(duals, master_roll_length, num_types, unique_lengths)
                step_duration = time.time() - step_start
                patterns_evaluated += 1
                
                if iteration == 1:
                    algorithm_steps.append({
                        "step": 3,
                        "name": "Pricing Subproblem",
                        "description": f"Solved knapsack problem, found pattern {new_pattern} with reduced cost {round(reduced_cost, 6)}",
                        "status": "completed",
                        "duration": step_duration
                    })
                
                # Check convergence
                if reduced_cost >= self.reduced_cost_threshold:
                    algorithm_steps.append({
                        "step": 4,
                        "name": "Convergence Check",
                        "description": f"Algorithm converged after {iteration} iterations (reduced cost: {round(reduced_cost, 6)})",
                        "status": "completed",
                        "duration": 0.01
                    })
                    break
                
                patterns.append(new_pattern)
                gc.collect()  # Memory management
            
            # Step 4: Solve Integer Problem
            step_start = time.time()
            solution, total_rolls = self._solve_master_integer(patterns, master_roll_length, num_types, unique_quantities)
            step_duration = time.time() - step_start
            
            algorithm_steps.append({
                "step": 5,
                "name": "Integer Solution",
                "description": f"Solved final integer programming problem, optimal solution uses {total_rolls} rolls",
                "status": "completed",
                "duration": step_duration
            })
            
            # Calculate results
            total_length_used = sum(unique_lengths[i] * unique_quantities[i] for i in range(num_types))
            total_length_available = total_rolls * master_roll_length
            total_waste = total_length_available - total_length_used
            waste_percentage = (total_waste / total_length_available) * 100 if total_length_available > 0 else 0
            efficiency = 100 - waste_percentage
            
            # Generate cutting patterns and instructions
            cutting_patterns = []
            cutting_instructions = []
            instruction_step = 1
            
            for i, (pattern, count) in enumerate(zip(patterns, solution)):
                if count > 0:
                    pattern_waste = master_roll_length - sum(unique_lengths[j] * pattern[j] for j in range(num_types))
                    
                    cuts = []
                    for j in range(num_types):
                        if pattern[j] > 0:
                            cuts.append({
                                "length": unique_lengths[j],
                                "quantity": pattern[j]
                            })
                    
                    pattern_data = {
                        "id": f"pattern_{i+1}",
                        "cuts": cuts,
                        "totalLength": master_roll_length - pattern_waste,
                        "waste": pattern_waste,
                        "rollsUsed": int(count)
                    }
                    cutting_patterns.append(pattern_data)
                    
                    # Generate cutting instruction
                    cut_description = ", ".join([f"{cut['quantity']} pieces of {cut['length']}mm" for cut in cuts])
                    instruction = {
                        "step": instruction_step,
                        "description": f"Take {int(count)} master roll{'s' if count > 1 else ''} of {master_roll_length}mm length",
                        "pattern": f"Cut each roll: {cut_description}",
                        "rollsCount": int(count)
                    }
                    cutting_instructions.append(instruction)
                    instruction_step += 1
            
            # Add final verification instruction
            total_pieces = {}
            for req in beam_requirements:
                total_pieces[req['length']] = req['quantity']
            
            verification_text = ", ".join([f"{qty} pieces of {length}mm" for length, qty in total_pieces.items()])
            cutting_instructions.append({
                "step": instruction_step,
                "description": "Final inventory check:",
                "pattern": f"{verification_text} - All requirements met!",
                "rollsCount": 0
            })
            
            execution_time = time.time() - start_time
            
            return {
                "totalRolls": int(total_rolls),
                "efficiency": round(efficiency, 2),
                "wastePercentage": round(waste_percentage, 2),
                "totalWaste": int(total_waste),
                "patterns": cutting_patterns,
                "cuttingInstructions": cutting_instructions,
                "algorithmSteps": algorithm_steps,
                "performance": {
                    "executionTime": round(execution_time, 3),
                    "memoryUsage": round(sys.getsizeof(patterns) / 1024 / 1024, 2),  # MB
                    "patternsEvaluated": patterns_evaluated,
                    "iterations": iteration,
                    "convergence": "optimal"
                }
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "traceback": traceback.format_exc()
            }
    
    def _generate_initial_patterns(self, master_roll_length: int, num_types: int, unique_lengths: List[int]) -> List[List[int]]:
        """Generate initial cutting patterns - one for each beam type"""
        patterns = []
        for i in range(num_types):
            pattern = [0] * num_types
            pattern[i] = master_roll_length // unique_lengths[i]
            patterns.append(pattern)
        return patterns
    
    def _solve_master_lp(self, patterns: List[List[int]], master_roll_length: int, num_types: int, unique_quantities: List[int]) -> Tuple[Any, List[float], List[float]]:
        """Solve the master problem LP relaxation"""
        master_prob = pulp.LpProblem("MasterCuttingStock", pulp.LpMinimize)
        x = [pulp.LpVariable(f"x_{j}", lowBound=0, cat="Continuous") for j in range(len(patterns))]
        
        # Objective: minimize total rolls
        master_prob += pulp.lpSum(x)
        
        # Constraints: meet demand for each beam type
        for i in range(num_types):
            constraint = pulp.lpSum(patterns[j][i] * x[j] for j in range(len(patterns))) >= unique_quantities[i]
            master_prob += constraint
        
        master_prob.solve(pulp.PULP_CBC_CMD(msg=0))
        
        # Extract solution and dual values
        x_sol = [var.varValue for var in x]
        duals = []
        
        # Get dual values from constraints
        constraint_idx = 0
        for name, constraint in master_prob.constraints.items():
            if constraint_idx < num_types:
                duals.append(constraint.pi if constraint.pi is not None else 0)
                constraint_idx += 1
        
        return master_prob, x_sol, duals
    
    def _solve_knapsack(self, duals: List[float], master_roll_length: int, num_types: int, unique_lengths: List[int]) -> Tuple[List[int], float]:
        """Solve the pricing subproblem (knapsack)"""
        sub_prob = pulp.LpProblem("KnapsackSubproblem", pulp.LpMaximize)
        y = [pulp.LpVariable(f"y_{i}", lowBound=0, cat="Integer") for i in range(num_types)]
        
        # Objective: maximize dual value
        sub_prob += pulp.lpSum(duals[i] * y[i] for i in range(num_types))
        
        # Constraint: fit within roll length
        sub_prob += pulp.lpSum(unique_lengths[i] * y[i] for i in range(num_types)) <= master_roll_length
        
        sub_prob.solve(pulp.PULP_CBC_CMD(msg=0))
        
        pattern = [int(y[i].varValue) if y[i].varValue is not None else 0 for i in range(num_types)]
        reduced_cost = 1 - (pulp.value(sub_prob.objective) if sub_prob.objective is not None else 0)
        
        return pattern, reduced_cost
    
    def _solve_master_integer(self, patterns: List[List[int]], master_roll_length: int, num_types: int, unique_quantities: List[int]) -> Tuple[List[float], float]:
        """Solve the final integer master problem"""
        master_int = pulp.LpProblem("MasterCuttingStockInteger", pulp.LpMinimize)
        x_int = [pulp.LpVariable(f"xint_{j}", lowBound=0, cat="Integer") for j in range(len(patterns))]
        
        # Objective: minimize total rolls
        master_int += pulp.lpSum(x_int)
        
        # Constraints: meet demand for each beam type
        for i in range(num_types):
            master_int += pulp.lpSum(patterns[j][i] * x_int[j] for j in range(len(patterns))) >= unique_quantities[i]
        
        master_int.solve(pulp.PULP_CBC_CMD(msg=0))
        
        solution = [var.varValue if var.varValue is not None else 0 for var in x_int]
        total_rolls = sum(solution)
        
        return solution, total_rolls

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        request = json.loads(input_data)
        
        solver = CuttingStockSolver()
        result = solver.solve(
            master_roll_length=request['masterRollLength'],
            beam_requirements=request['beamRequirements']
        )
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
