import sys

def count_chars(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    counts = {
        '{': content.count('{'),
        '}': content.count('}'),
        '(': content.count('('),
        ')': content.count(')'),
        '<': content.count('<'),
        '>': content.count('>'),
        '[': content.count('['),
        ']': content.count(']'),
        '/*': content.count('/*'),
        '*/': content.count('*/'),
    }
    
    for char, count in counts.items():
        print(f"{char}: {count}")

if __name__ == "__main__":
    count_chars(sys.argv[1])
