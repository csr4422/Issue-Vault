import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py [sync|render|auto]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "sync":
        from sync import sync_all
        sync_all()
        
    elif command == "render":
        from render import main as render_main
        render_main()
        
    elif command == "auto":
        from sync import sync_all
        from render import render_from_config
        
        print("Syncing issues...")
        sync_all()
        
        print("Generating archive...")
        render_from_config()
        
        print("Done!")
        
    else:
        print(f"Unknown: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()