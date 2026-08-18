#!/usr/bin/env python3
"""
Build the Composio 100-App static site.
Combines template.html with styles.css, render.js, and data/apps_dataset.json.
"""

import json
import os

def build():
    # Load components
    with open('template.html', 'r', encoding='utf-8') as f:
        template = f.read()
    
    with open('styles.css', 'r', encoding='utf-8') as f:
        css = f.read()
        
    with open('render.js', 'r', encoding='utf-8') as f:
        js = f.read()
        
    # Load dataset
    data_path = os.path.join('..', 'data', 'apps_dataset.json')
    with open(data_path, 'r', encoding='utf-8') as f:
        apps_data = json.load(f)
        
    # Dump JSON directly into the JS string
    apps_json_str = json.dumps(apps_data)
    js = js.replace('{{APPS_JSON}}', apps_json_str)
    
    # Inject into template
    html = template.replace('{{CSS}}', css)
    html = html.replace('{{JS}}', js)
    
    # Output to index.html
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print(f"Successfully built index.html ({len(html)} bytes)")

if __name__ == '__main__':
    build()
