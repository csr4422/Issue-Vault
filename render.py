import sqlite3
import json
import logging
from pathlib import Path
from typing import Dict, List
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class RenderError(Exception):
    pass


class IssueRenderer:
    
    def __init__(self, db_path: str, template_dir: str = "templates", output_dir: str = "output"):
        self.db_path = Path(db_path)
        self.template_dir = Path(template_dir)
        self.output_dir = Path(output_dir)
        
        self._validate_paths()
    
    def _validate_paths(self) -> None:
        if not self.db_path.exists():
            raise RenderError(f"Database not found: {self.db_path}")
        
        if not self.template_dir.exists():
            raise RenderError(f"Template directory not found: {self.template_dir}")
        
        required_templates = ['index.html', 'style.css', 'script.js']
        for template in required_templates:
            template_path = self.template_dir / template
            if not template_path.exists():
                raise RenderError(f"Required template not found: {template_path}")
    
    def get_all_data(self) -> Dict:
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            logger.info("Fetching data from database")
            
            # Get all repos
            cursor.execute("SELECT * FROM repos")
            repos = [dict(row) for row in cursor.fetchall()]
            
            # Get all issues with repo info
            cursor.execute('''
                SELECT 
                    issues.*,
                    repos.owner as repo_owner,
                    repos.name as repo_name
                FROM issues
                JOIN repos ON issues.repo_id = repos.id
                ORDER BY issues.updated_at DESC
            ''')
            issues = [dict(row) for row in cursor.fetchall()]
            
            # Get all labels
            cursor.execute('SELECT issue_id, name, color FROM labels ORDER BY issue_id')
            labels_rows = cursor.fetchall()
            
            # Group labels by issue_id
            labels_by_issue = {}
            for row in labels_rows:
                row_dict = dict(row)
                issue_id = row_dict['issue_id']
                
                if issue_id not in labels_by_issue:
                    labels_by_issue[issue_id] = []
                
                labels_by_issue[issue_id].append({
                    'name': row_dict['name'],
                    'color': row_dict['color']
                })
            
            # Attach labels to issues
            for issue in issues:
                issue['labels'] = labels_by_issue.get(issue['id'], [])
            
            conn.close()
            
            # Calculate statistics
            open_count = sum(1 for i in issues if i['state'] == 'open')
            closed_count = len(issues) - open_count
            
            data = {
                'repos': repos,
                'issues': issues,
                'total_issues': len(issues),
                'total_repos': len(repos),
                'open_issues': open_count,
                'closed_issues': closed_count,
                'generated_at': datetime.now().isoformat()
            }
            
            logger.info(f"Loaded {data['total_issues']} issues from {data['total_repos']} repos")
            
            return data
            
        except sqlite3.Error as e:
            logger.error(f"Database error: {e}")
            raise RenderError(f"Failed to fetch data from database: {e}")
    
    def _read_template(self, filename: str) -> str:
        """Read template file content"""
        try:
            template_path = self.template_dir / filename
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except IOError as e:
            raise RenderError(f"Failed to read template {filename}: {e}")
    
    def _write_output(self, content: str, filename: str = "index.html") -> Path:
        """Write rendered content to output file"""
        try:
            self.output_dir.mkdir(parents=True, exist_ok=True)
            
            output_path = self.output_dir / filename
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return output_path
            
        except IOError as e:
            raise RenderError(f"Failed to write output file: {e}")
    
    def generate(self, output_filename: str = "index.html") -> Path:
     
        logger.info("Starting HTML generation")
        data = self.get_all_data()
        
        # Read template files
        html = self._read_template('index.html')
        css = self._read_template('style.css')
        js = self._read_template('script.js')
        
        # Prepare data as JSON
        issues_json = json.dumps(data['issues'], indent=2, ensure_ascii=False)
        
        # Replace placeholder with actual data
        html = html.replace('{{ISSUES_DATA}}', issues_json)
        
        # Inline CSS
        html = html.replace(
            '<link rel="stylesheet" href="style.css">',
            f'<style>\n{css}\n</style>'
        )       
        
        # Inline JavaScript
        html = html.replace(
            '<script src="script.js"></script>',
            f'<script>\n{js}\n</script>'
        )
        
        # Add generation metadata as comment
        metadata = f"""<!--
Generated by Issue Vault
Date: {data['generated_at']}
Total Issues: {data['total_issues']}
Total Repos: {data['total_repos']}
-->"""
        html = html.replace('</head>', f'{metadata}\n</head>')
        
        # Write output
        output_path = self._write_output(html, output_filename)
        file_size_kb = output_path.stat().st_size / 1024
        logger.info(f"Generated {output_path} ({file_size_kb:.2f} KB)")
        
        return output_path


def render_from_config(config_path: str = "config.toml", output_filename: str = "index.html") -> Path:
  
    try:
        from config import load_config, get_db_path
        
        config = load_config(config_path)
        db_path = get_db_path(config)
        
        renderer = IssueRenderer(db_path)
        return renderer.generate(output_filename)
        
    except Exception as e:
        logger.error(f"Failed to render: {e}")
        raise


def main():
    try:
        output_path = render_from_config()
        print(f"\nSuccess! Open the file in your browser:")
        print(f"{output_path.absolute()}")
        
    except RenderError as e:
        logger.error(f"Render error: {e}")
        exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
