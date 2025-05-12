#!/usr/bin/env python3
# filepath: insert_projects.py
import json
import requests
import datetime

# API endpoint
API_URL = "http://localhost:3000/api/projects"

# Sample projects data
projects_data = [{"imageUrl":{"grid":"http://localhost:3000/api/projects/image/gridImage-1746541651780-673580230.png","list":"http://localhost:3000/api/projects/image/listImage-1746541651787-878484443.png"},"_id":"681a07f2a25e89c24bb568e8","title":"Ultimate Converter","description":["Description of project 1.","Another line of description for project 1."],"link":"https://ultimate-converter.missclick.net","date":"2025-01","tags":["Website","Software"],"technologies":["Flask","FFmpeg","Python","HTML","CSS","Docker","JavaScript","SpotDL","Youtube-dl","Inkscape"],"__v":0},{"imageUrl":{"grid":"http://localhost:3000/api/projects/image/gridImage-1746598609127-902367703.png","list":"http://localhost:3000/api/projects/image/listImage-1746598609128-624117183.png"},"_id":"681a07f2a25e89c24bb568ea","title":"Square Game","description":["Description of project 4.","Another line of description for project 4."],"link":"https://github.com/Gabrieleirbag1/Square-Game/releases","date":"2024-09","tags":["Website","Software"],"technologies":["HTML","CSS","JavaScript"],"__v":0},{"imageUrl":{"grid":"http://localhost:3000/api/projects/image/gridImage-1746625766872-302337423.png","list":"http://localhost:3000/api/projects/image/listImage-1746625766883-872551325.png"},"_id":"681a07f2a25e89c24bb568ec","title":"FindWord","description":["Description of project 2.","Another line of description for project 2."],"link":"https://findword.missclick.net","date":"2024-08","tags":["Website","Game"],"technologies":["Django","WebSocket","Python","HTML","CSS","JavaScript"],"__v":0},{"imageUrl":{"grid":"http://localhost:3000/api/projects/image/gridImage-1747039079842-351571183.png","list":"http://localhost:3000/api/projects/image/listImage-1747039079863-153797956.png"},"_id":"681a07f2a25e89c24bb568ee","title":"Kaboom","description":["Description of project 3.","Another line of description for project 3."],"link":"https://github.com/Gabrieleirbag1/Kaboom/releases","date":"2024-10","tags":["Game","Software"],"technologies":["Python","PyQt5"],"__v":0},{"imageUrl":{"grid":"http://localhost:3000/api/projects/image/gridImage-1747039090730-90270807.png","list":"http://localhost:3000/api/projects/image/listImage-1747039090744-88270682.png"},"_id":"681a07f2a25e89c24bb568f0","title":"Streaming Power","description":["Description of project 4.","Another line of description for project 4."],"link":"https://missclick.net/streamingpower/","date":"2023-10","tags":["Website"],"technologies":["Django","Python","HTML","CSS","JavaScript"],"__v":0}]

def process_date(date_str):
    """Convert string year to a proper date format"""
    # For simplicity, we'll use January 1st of the given year
    year = int(date_str)
    date_obj = datetime.date(year, 1, 1)
    # Format as ISO string (YYYY-MM-DD)
    return date_obj.isoformat()

def insert_projects():
    """Insert projects into the database via API"""
    success_count = 0
    failure_count = 0
    
    for project in projects_data:
        # Convert the year string to a proper date
        # Send POST request to API
        try:
            response = requests.post(API_URL, json=project)
            
            if response.status_code in (200, 201):
                print(f"✅ Successfully added project: {project['title']}")
                success_count += 1
            else:
                print(f"❌ Failed to add project: {project['title']}")
                print(f"   Status code: {response.status_code}")
                print(f"   Response: {response.text}")
                failure_count += 1
                
        except Exception as e:
            print(f"❌ Error adding project {project['title']}: {str(e)}")
            failure_count += 1
    
    print(f"\nSummary: {success_count} projects added successfully, {failure_count} failed")

if __name__ == "__main__":
    print("Starting to insert projects into the database...\n")
    insert_projects()
    print("\nProcess completed.")