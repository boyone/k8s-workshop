# YAML Hands-On Tutorial for Beginners

## What is YAML?

YAML (YAML Ain't Markup Language) is a human-readable data serialization standard. It's commonly used for configuration files, data exchange, and storing structured data. YAML files use the `.yml` or `.yaml` extension.

## Basic Rules

- **Case sensitive**: `Name` and `name` are different
- **Indentation matters**: Use spaces (not tabs) for indentation
- **Comments**: Start with `#`
- **File structure**: Key-value pairs separated by colons

---

## 1. Basic Key-Value Pairs

**Example:**
```yaml
# Personal Information
name: John Doe
age: 30
city: New York
married: true
```

**Try it yourself:**
Create a YAML file with your personal information including name, age, favorite color, and whether you like pizza.

---

## 2. Strings

```yaml
# Different ways to write strings
simple_string: Hello World
quoted_string: "Hello World"
single_quoted: 'Hello World'

# Multi-line strings
description: |
  This is a multi-line string
  that preserves line breaks
  and formatting.

folded_string: >
  This is a folded string
  that will be converted
  to a single line.

# String with special characters
message: "He said, \"Hello!\""
```

**Exercise:**
Write a YAML block that includes:
- Your favorite quote (with proper quotation marks)
- A multi-line poem or song lyrics
- A folded description of your hobby

---

## 3. Numbers and Booleans

```yaml
# Numbers
integer: 42
float: 3.14159
negative: -17
scientific: 1.23e+3

# Booleans
is_active: true
is_deleted: false
is_enabled: yes    # Also valid
is_visible: no     # Also valid

# Null values
middle_name: null
nickname: ~        # Also represents null
```

**Practice:**
Create a product inventory with:
- Product ID (number)
- Price (decimal)
- In stock (boolean)
- Discount rate (percentage as decimal)

---

## 4. Lists (Arrays)

```yaml
# Simple list
fruits:
  - apple
  - banana
  - orange

# Inline list
colors: [red, green, blue]

# List of numbers
scores: [85, 92, 78, 96]

# Mixed list
mixed_items:
  - name
  - 123
  - true
  - null
```

**Hands-on Task:**
Create lists for:
- Your top 5 favorite movies
- Three programming languages you want to learn
- Your weekly schedule (days of the week)

---

## 5. Nested Objects (Dictionaries)

```yaml
person:
  name: Alice Smith
  age: 28
  address:
    street: 123 Main St
    city: Boston
    state: MA
    zip: 02101
  contact:
    email: alice@example.com
    phone: 555-0123
```

**Exercise:**
Create a nested structure for a book including:
- Title and author
- Publication details (year, publisher, ISBN)
- Categories (fiction/non-fiction, genre)

---

## 6. Lists of Objects

```yaml
employees:
  - name: John Doe
    position: Developer
    salary: 75000
    skills:
      - Python
      - JavaScript
      
  - name: Jane Smith
    position: Designer
    salary: 68000
    skills:
      - Photoshop
      - Figma

students:
  - id: 1
    name: Mike Johnson
    grades: [85, 90, 88]
  - id: 2
    name: Sarah Wilson
    grades: [92, 87, 94]
```

**Practice Project:**
Create a YAML structure for a library system with:
- At least 3 books, each with title, author, year, and available status
- At least 2 library members with name, ID, and borrowed books list

---

## 7. Advanced Features

### Anchors and References
```yaml
# Define an anchor
default_settings: &defaults
  timeout: 30
  retries: 3
  debug: false

# Use the reference
development:
  <<: *defaults
  debug: true

production:
  <<: *defaults
  timeout: 60
```

### Multi-document YAML
```yaml
# Document 1
name: Config 1
version: 1.0
---
# Document 2
name: Config 2
version: 2.0
```

---

## 8. Real-World Examples

### Configuration File Example
```yaml
# Application Configuration
app:
  name: MyWebApp
  version: 1.2.3
  port: 8080
  
database:
  host: localhost
  port: 5432
  name: myapp_db
  username: admin
  password: secret123
  
logging:
  level: INFO
  file: /var/log/myapp.log
  max_size: 10MB
  
features:
  user_registration: true
  email_notifications: true
  dark_mode: false
```

### Docker Compose Example
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    
  database:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

---

## 9. Hands-On Projects

### Project 1: Personal Portfolio
Create a YAML file representing your personal portfolio:
```yaml
portfolio:
  personal_info:
    # Your details here
  
  skills:
    # List your skills
    
  projects:
    # At least 2 projects with name, description, technologies
    
  education:
    # Your educational background
    
  experience:
    # Work experience (if any)
```

### Project 2: Restaurant Menu
Design a restaurant menu in YAML:
```yaml
restaurant:
  name: "Tasty Bites"
  location: "Downtown"
  
  menu:
    appetizers:
      # List appetizers with name, description, price
      
    main_courses:
      # Main dishes
      
    desserts:
      # Dessert options
      
    beverages:
      # Drinks menu
```

### Project 3: School Management System
```yaml
school:
  name: "Springfield High"
  
  classes:
    # Different classes with grade, teacher, students
    
  teachers:
    # Teacher information
    
  subjects:
    # Available subjects
```

---

## 10. Common Mistakes and How to Avoid Them

### ❌ Wrong Indentation
```yaml
# Incorrect
person:
name: John  # Wrong indentation
  age: 30   # Inconsistent indentation
```

### ✅ Correct Indentation
```yaml
# Correct
person:
  name: John
  age: 30
```

### ❌ Using Tabs
```yaml
# Don't use tabs for indentation
person:
	name: John  # Tab used - this will cause errors
```

### ✅ Use Spaces
```yaml
# Use spaces consistently
person:
  name: John  # 2 spaces used
```

### ❌ Unquoted Special Characters
```yaml
# Problematic
message: Hello: World  # Colon can cause issues
time: 12:30           # Can be interpreted as nested object
```

### ✅ Quoted When Necessary
```yaml
# Safe
message: "Hello: World"
time: "12:30"
```

---

## 11. Validation and Tools

### Online YAML Validators:
- yamllint.com
- yamlchecker.com
- onlineyamltools.com

### Command Line Tools:
```bash
# Install yamllint
pip install yamllint

# Validate YAML file
yamllint myfile.yaml
```

---

## 12. Practice Exercises

### Exercise 1: Personal Information
Create a YAML file with:
- Your personal details
- Family members
- Hobbies and interests
- Goals for this year

### Exercise 2: Inventory System
Design an inventory system for a store:
- Product categories
- Products with details (name, price, quantity, supplier)
- Suppliers information

### Exercise 3: Event Planning
Create a YAML structure for planning an event:
- Event details (name, date, location)
- Attendees list
- Schedule/agenda
- Budget breakdown

### Exercise 4: Fix the Errors
```yaml
# Find and fix the errors in this YAML
event
  name "Summer Festival"
  date: 2024-07-15
  location:
  street: 123 Park Ave
    city: Springfield
   attendees:
     - name: John
     age: 25
     - name: "Sarah"
       age 30
  budget:
    venue: $500
    food: $800
    entertainment: 300
```

---

## Summary

You've learned:
- Basic YAML syntax and structure
- Working with different data types
- Creating nested objects and lists
- Real-world applications
- Common mistakes to avoid
- Validation techniques

**Next Steps:**
1. Practice with the exercises provided
2. Try creating YAML files for your own projects
3. Learn about YAML in specific contexts (Docker, Kubernetes, CI/CD)
4. Explore advanced features like custom tags and complex anchors

**Remember:** The key to mastering YAML is practice. Start simple and gradually work with more complex structures!