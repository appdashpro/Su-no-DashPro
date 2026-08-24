import re
import os
from collections import Counter

class_counter = Counter()

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            with open(os.path.join(root, file), 'r') as f:
                content = f.read()
                matches = re.findall(r'className="([^"]+)"', content)
                for match in matches:
                    classes = match.split()
                    class_counter.update(classes)

for cls, count in class_counter.most_common(50):
    if 'slate' in cls or 'white' in cls or 'bg-' in cls or 'text-' in cls or 'border-' in cls:
        print(f"{cls}: {count}")
