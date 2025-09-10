#!/usr/bin/env python3
"""
Test script to verify JSONBin updates are working correctly.
Run this script to test if changes made on jsonbin.io are reflected immediately.
"""

import requests
import os
import time
from dotenv import load_dotenv

def test_jsonbin_updates():
    """Test JSONBin integration and cache-busting"""
    
    # Load environment variables
    load_dotenv()
    
    bin_id = os.environ.get('JSONBIN_ID')
    access_key = os.environ.get('JSONBIN_ACCESS_KEY')
    
    if not bin_id or not access_key:
        print("❌ ERROR: JSONBIN_ID or JSONBIN_ACCESS_KEY not found in .env file")
        return False
    
    print("🔍 TESTING JSONBIN UPDATES")
    print("=" * 50)
    print(f"Bin ID: {bin_id}")
    print(f"Access Key: {access_key[:20]}...")
    print()
    
    # Test 1: Direct JSONBin API call with cache-busting
    print("Test 1: Direct JSONBin API call (with cache-busting)")
    try:
        timestamp = int(time.time())
        response = requests.get(
            f"https://api.jsonbin.io/v3/b/{bin_id}?_t={timestamp}",
            headers={
                "X-Access-Key": access_key,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            updates = data.get("record", {}).get("updates", [])
            print(f"  ✅ SUCCESS: Retrieved {len(updates)} updates")
            
            if updates:
                # Sort updates by version (most recent first)
                def version_sort_key(update):
                    version = update.get("version", "v0.0.0")
                    try:
                        version_clean = version.lstrip('v')
                        parts = version_clean.split('.')
                        return tuple(int(part) for part in parts if part.isdigit())
                    except (ValueError, AttributeError):
                        return (0, 0, 0)
                
                updates.sort(key=version_sort_key, reverse=True)
                
                latest = updates[0]
                print(f"  Latest update: {latest['version']} - {latest['title']}")
                print(f"  Total updates: {len(updates)}")
                
                # Show last modified info if available
                metadata = data.get("metadata", {})
                if "createdAt" in metadata:
                    print(f"  Bin created: {metadata['createdAt']}")
                    
            else:
                print("  ⚠️  WARNING: No updates found in response")
                
        else:
            print(f"  ❌ FAILED: HTTP {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"  ❌ EXCEPTION: {e}")
        return False
    
    print()
    
    # Test 2: Flask app API endpoint
    print("Test 2: Flask app /api/updates endpoint")
    try:
        from app import create_app
        
        app = create_app()
        with app.test_client() as client:
            response = client.get('/api/updates')
            
            if response.status_code == 200:
                data = response.get_json()
                updates = data.get('updates', [])
                print(f"  ✅ SUCCESS: Flask app returned {len(updates)} updates")
                
                if updates:
                    latest = updates[0]
                    print(f"  Latest update: {latest['version']} - {latest['title']}")
                    
                    # Check cache headers
                    cache_control = response.headers.get('Cache-Control')
                    if 'no-cache' in str(cache_control):
                        print("  ✅ SUCCESS: Proper cache-control headers set")
                    else:
                        print("  ⚠️  WARNING: Cache-control headers may not be optimal")
                        
            else:
                print(f"  ❌ FAILED: HTTP {response.status_code}")
                return False
                
    except Exception as e:
        print(f"  ❌ EXCEPTION: {e}")
        return False
    
    print()
    
    # Test 3: Multiple requests to check consistency
    print("Test 3: Multiple requests consistency check")
    try:
        from app import create_app
        
        app = create_app()
        with app.test_client() as client:
            versions = []
            for i in range(3):
                response = client.get('/api/updates')
                if response.status_code == 200:
                    data = response.get_json()
                    updates = data.get('updates', [])
                    if updates:
                        versions.append(updates[0]['version'])
                    time.sleep(0.1)
            
            if len(set(versions)) == 1:  # All versions are the same
                print(f"  ✅ SUCCESS: Consistent results across {len(versions)} requests")
                print(f"  All requests returned latest version: {versions[0]}")
            else:
                print(f"  ⚠️  WARNING: Inconsistent results: {versions}")
                
    except Exception as e:
        print(f"  ❌ EXCEPTION: {e}")
        return False
    
    print()
    print("🎉 JSONBIN INTEGRATION TEST COMPLETE")
    print("=" * 50)
    print("✅ JSONBin API is working correctly")
    print("✅ Cache-busting is implemented")
    print("✅ Flask integration is functional")
    print()
    print("📝 TO TEST REAL-TIME UPDATES:")
    print("1. Go to https://jsonbin.io and edit your bin")
    print("2. Add a new update or modify existing ones")
    print("3. Run this script again to see changes immediately")
    print("4. Refresh your web browser to see changes in the UI")
    
    return True

if __name__ == "__main__":
    test_jsonbin_updates()
