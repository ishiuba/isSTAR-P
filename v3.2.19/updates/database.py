import sqlite3
import re
from datetime import datetime

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def version_key(version_str):
    """
    Convert version string to a tuple for proper sorting.
    Examples:
    - "v1.2.3" -> (1, 2, 3, 0)
    - "1.2" -> (1, 2, 0, 0)
    - "v3.0.6" -> (3, 0, 6, 0)
    - "3.1.7" -> (3, 1, 7, 0)
    - "v3.2.12" -> (3, 2, 12, 0)
    - Non-version strings will be sorted last
    """
    if not version_str:
        return (-1, -1, -1, -1)  # Place empty versions at the end

    # Remove 'v' prefix if present
    if version_str.lower().startswith('v'):
        version_str = version_str[1:]

    # Try to extract version numbers using regex
    match = re.match(r'(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?', version_str)
    if not match:
        return (-1, -1, -1, -1)  # Not a version string, sort at the end

    # Convert matched groups to integers, defaulting to 0 for missing parts
    parts = []
    for i in range(1, 5):
        part = match.group(i)
        parts.append(int(part) if part else 0)

    return tuple(parts)

def init_db():
    conn = get_db_connection()
    conn.execute('''
    CREATE TABLE IF NOT EXISTS updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        version TEXT
    )
    ''')
    conn.commit()
    conn.close()

def add_update(title, content, version=None):
    conn = get_db_connection()
    conn.execute('INSERT INTO updates (title, content, version) VALUES (?, ?, ?)',
                (title, content, version))
    conn.commit()
    conn.close()

def get_update(id):
    conn = get_db_connection()
    update = conn.execute('SELECT * FROM updates WHERE id = ?', (id,)).fetchone()
    conn.close()
    return update

def update_update(id, title, content, version=None):
    conn = get_db_connection()
    conn.execute('UPDATE updates SET title = ?, content = ?, version = ? WHERE id = ?',
                (title, content, version, id))
    conn.commit()
    conn.close()

def delete_update(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM updates WHERE id = ?', (id,))
    conn.commit()
    conn.close()

def get_updates_by_version(order='DESC'):
    """
    Get all updates ordered by version.

    Args:
        order: 'DESC' for descending (newest first) or 'ASC' for ascending (oldest first)

    Returns:
        List of update rows sorted by version
    """
    conn = get_db_connection()
    updates = conn.execute('SELECT * FROM updates').fetchall()
    conn.close()

    # Convert to list of dictionaries for easier sorting
    update_list = []
    for update in updates:
        update_dict = dict(update)
        update_list.append(update_dict)

    # Sort by version using our version_key function
    sorted_updates = sorted(
        update_list,
        key=lambda x: version_key(x['version']),
        reverse=(order.upper() == 'DESC')
    )

    return sorted_updates
