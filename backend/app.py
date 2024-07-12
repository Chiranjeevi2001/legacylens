from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import os
os.environ["GIT_PYTHON_REFRESH"] = "quiet"
import shutil
import pygit2
import lizard

app = FastAPI()	
SUPPORTED_EXTENSIONS = ['.py', '.java', '.c', '.cpp', '.js', '.json', '.cc', '.sh']

# function to clone a repo
def clone_repo(clone_url, repo_dir):
    try:
        pygit2.clone_repository(clone_url, repo_dir)
    except:
        raise Exception("Error in cloning the repo")

# function to calculate_loc (excluding comments and empty lines)
def calculate_loc(file_path):
    try:
        loc = 0
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            if(lines):
                loc += len(lines)
        return loc
    except Exception as e:
        print(f"Error in calculate_loc for file: {file_path} - {e}")
        return 0
        

@app.get("/")
async def health_check():
    return {"Health Check ":  "is successful!"}

@app.get('/repo_avg_loc')
async def get_repo_files_count(owner: str, repo: str):
    if not owner or not repo:
        raise HTTPException(status_code=400, detail="Owner and Repo are required. Please provide both of them")
    
    clone_url = f'https://github.com/{owner}/{repo}.git'
    repo_dir = f'/tmp/{owner}_{repo}'
    
    # clean up
    if os.path.exists(repo_dir):
        shutil.rmtree(repo_dir)
    
    try:
        clone_repo(clone_url, repo_dir)
    except Exception as e:
        print(f"Error in cloning the repo: {e}")
        raise HTTPException(status_code=500, detail="Error in cloning the repo"+str(e))
    
    total_loc = 0
    file_count = 0
    
    for root, _, files in os.walk(repo_dir):
        for file in files:
            if os.path.splitext(file)[-1] in SUPPORTED_EXTENSIONS:
                file_path = os.path.join(root, file)
                loc = calculate_loc(file_path)
                total_loc += loc
                file_count += 1
                
    shutil.rmtree(repo_dir)
    
    if file_count == 0:
        raise HTTPException(status_code=400, detail="No supported files found in the repo")

    average_loc = total_loc/file_count
    average_loc = round(average_loc, 2)
    
    return JSONResponse(content = {"file_count": file_count, "total_loc": total_loc, "avg_loc": average_loc})


def calculate_average_cyclomatic_complexity(repo_dir):
    all_files = []
    for root, dirs, files in os.walk(repo_dir):
        for file in files:
            if file.endswith(('.py', '.c', '.cpp', '.js', '.java', '.cs', '.go', '.swift', '.rb')):
                all_files.append(os.path.join(root, file))

    if not all_files:
        print("No supported files found to calculate complexity.")
        return None

    total_complexity = 0
    count = 0
    for file in all_files:
        analysis_result = lizard.analyze_file(file)
        for function in analysis_result.function_list:
            total_complexity += function.cyclomatic_complexity
            count += 1

    if count == 0:
        return None

    average_complexity = total_complexity / count
    return {"avg_complexity":average_complexity, "total_files":len(all_files), "total_functions":count, "total_complexity":total_complexity}


@app.get('/get_avg_ccn')
async def get_avg_ccn(owner: str, repo: str):
    if not owner or not repo:
        raise HTTPException(status_code=400, detail="Owner and Repo are required. Please provide both of them")
    
    clone_url = f'https://github.com/{owner}/{repo}.git'
    repo_dir = f'/tmp/{owner}_{repo}'
    
    # clean up
    if os.path.exists(repo_dir):
        shutil.rmtree(repo_dir)
    
    try:
        clone_repo(clone_url, repo_dir)
    except Exception as e:
        print(f"Error in cloning the repo: {e}")
        raise HTTPException(status_code=500, detail="Error in cloning the repo"+str(e))
    
    res = calculate_average_cyclomatic_complexity(repo_dir)
    shutil.rmtree(repo_dir)
    return JSONResponse(content = {"avg_complexity": round(res['avg_complexity'], 2), "total_functions": res['total_functions'], "total_complexity": res['total_complexity']})
