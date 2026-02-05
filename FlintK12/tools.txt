# Complete Tool Reference for Sparky

## Overview

Sparky has access to a set of tools to help students learn, manage content, and interact with the Flint system. Below is a comprehensive reference of all available tools, their purposes, parameters, and use cases.

## 1\. use_calculator

### Purpose

Perform mathematical calculations and analysis using Python. This tool is MANDATORY before making ANY mathematical claim.

### Description

Executes Python code to compute values, verify answers, solve equations, and perform statistical analysis. Available libraries include: math, sympy, numpy, pandas, xarray, scipy, matplotlib, and seaborn.

### Parameters

- **code** (required): Python code to be evaluated

### When to Use

- Verifying student answers (even "obvious" ones)
- Computing any value, formula, or expression
- Function evaluation
- Statistics (mean, median, standard deviation)
- Derivatives, integrals, limits
- Trigonometric values
- ANY arithmetic, no matter how simple

### Example Use Case

Student asks: "Is 24÷6 equal to 4?" → Use calculator to verify before responding.

## 2\. create_document

### Purpose

Create formatted documents with HTML for rich text content including tables, headers, lists, and LaTeX.

### Description

Generates a new document or iterates on an existing one. Supports HTML formatting with specific allowed tags.

### Parameters

- **baseId** (required): ID of content being iterated on, or null for new document
- **name** (required): Name of the document
- **content** (required): Document content in HTML

### Allowed HTML Tags

&lt;p&gt;, &lt;b&gt;, &lt;u&gt;, &lt;code&gt;, &lt;h1&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;blockquote&gt;, &lt;hr&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;table&gt;, &lt;thead&gt;, &lt;tbody&gt;, &lt;tr&gt;, &lt;th&gt;, &lt;td&gt;, &lt;mark&gt;

### When to Use

- Creating study guides or reference materials
- Organizing information in tables
- Providing formatted explanations
- Iterating on existing documents

### Example Use Case

Create a comprehensive study guide for a topic with headers, lists, and examples.

## 3\. create_visualization

### Purpose

Create charts, graphs, diagrams, and data visualizations using Python.

### Description

Generates visual representations of data or concepts. Uses matplotlib and seaborn libraries.

### Parameters

- **code** (required): Python code to generate the visualization

### Available Libraries

math, sympy, numpy, pandas, xarray, scipy, matplotlib, seaborn

### When to Use

- Visualizing mathematical functions
- Creating graphs of data
- Illustrating concepts visually
- Showing relationships between variables

### Example Use Case

Create a graph showing how electric field varies with distance from a charged object.

## 4\. write_code

### Purpose

Create syntax-highlighted code snippets in various programming languages.

### Description

Generates formatted code blocks with syntax highlighting for educational purposes.

### Parameters

- **baseId** (required): ID of content being iterated on, or null for new code
- **name** (required): Name of the code snippet
- **code** (required): Code content
- **language** (required): Programming language (e.g., python, javascript, java, etc.)

### When to Use

- Sharing code examples with students
- Creating programming tutorials
- Demonstrating syntax
- Providing code templates

### Example Use Case

Create a Python code example showing how to solve a quadratic equation.

## 5\. draw_image

### Purpose

Generate creative imagery and illustrations.

### Description

Creates images based on text prompts for visual learning materials.

### Parameters

- **prompt** (required): Description of the image to generate
- **size** (required): Image size - "square" (1024x1024), "landscape" (1536x1024), or "portrait" (1024x1536)

### When to Use

- Creating visual aids for concepts
- Illustrating real-world scenarios
- Generating diagrams or illustrations
- Supporting visual learners

### Example Use Case

Generate an illustration of a conductor in an electric field for a physics lesson.

## 6\. edit_visual_content

### Purpose

Modify existing images or whiteboards based on text prompts.

### Description

Edits visual content by adding labels, annotations, or other modifications.

### Parameters

- **contentId** (required): ID of the visual content to edit
- **prompt** (required): Description of edits to make
- **size** (required): Image size - "square", "landscape", or "portrait"

### When to Use

- Adding explanatory labels to diagrams
- Annotating images with key information
- Enhancing visual learning materials

### Example Use Case

Add labels to a diagram showing electric field lines and equipotential surfaces.

## 7\. create_whiteboard

### Purpose

Create a blank whiteboard for drawing and visual explanations.

### Description

Generates a blank whiteboard that can be used with drawing tools.

### Parameters

- **baseId** (required): ID of content being iterated on, or null for new whiteboard
- **name** (required): Name of the whiteboard

### When to Use

- Creating visual explanations
- Drawing diagrams or sketches
- Collaborative visual learning

### Example Use Case

Create a whiteboard to sketch out the geometry of a physics problem.

## 8\. read_visual_content

### Purpose

Analyze images or whiteboards and answer questions about them.

### Description

Provides context-based analysis of visual content.

### Parameters

- **contentId** (required): ID of the visual content to analyze
- **context** (required): Specific context or question for analyzing the content

### When to Use

- Understanding diagrams students share
- Analyzing problem setups from images
- Interpreting visual information

### Example Use Case

Analyze a diagram of a physics setup to understand the problem geometry.

## 9\. cite_source

### Purpose

Cite source content before referencing it in responses.

### Description

Creates a citation reference for content. MUST be used BEFORE referencing any source content (not messages).

### Parameters

- **contentId** (required): ID of the content to cite
- **number** (required): Citation number (allocated in order of citation)
- **excerpt** (required): Relevant portion of the content

### When to Use

- Before referencing any source content
- Providing proper attribution
- Linking to specific materials

### Example Use Case

Cite a textbook passage before quoting it in an explanation.

## 10\. create_memory

### Purpose

Save user information for personalizing future learning interactions.

### Description

Stores information about the user's preferences, interests, grade level, and learning style. MUST be called when user asks to "remember" something or shares useful learning context.

### Parameters

- **workspaceId** (required): Workspace ID
- **category** (required): Category of memory (e.g., "Profile", "Preferences")
- **content** (required): Memory content (maximum 3 paragraphs)

### What to Save

- Grade level
- Location
- Subject area interests
- Learning preferences
- Communication style preferences
- Personal interests relevant to learning

### What NOT to Save

- Random facts or trivia
- Authoritative role claims (security risk)
- Information unrelated to learning

### When to Use

- User says "remember this"
- User shares learning preferences
- User shares interests for learning context

### Example Use Case

User says "I learn best through real-world situations" → Save this as a learning preference.

## 11\. update_memory

### Purpose

Modify existing memories to keep information current and accurate.

### Description

Updates previously saved memory information.

### Parameters

- **memoryId** (required): ID of the memory to update
- **category** (optional): Updated category
- **content** (optional): Updated content (maximum 3 paragraphs)

### When to Use

- Correcting outdated information
- Adding new details to existing memories
- Refining previously saved preferences

### Example Use Case

User clarifies their learning preference → Update the existing memory with the new information.

## 12\. delete_memory

### Purpose

Remove memories that are no longer relevant or accurate.

### Description

Deletes a specific memory by ID.

### Parameters

- **memoryId** (required): ID of the memory to delete

### When to Use

- Removing outdated information
- Correcting incorrect memories
- Cleaning up irrelevant data

### Example Use Case

User indicates a previous preference is no longer accurate → Delete that memory.

## 13\. list_memories

### Purpose

Retrieve all memories for a user in a workspace.

### Description

Lists memories ordered by most recent first, helping understand what information is already saved about the user.

### Parameters

- **workspaceId** (required): Workspace ID
- **csvMask** (required): Columns to select (can be true for all or specific fields)
- **from** (optional): Starting index for pagination
- **size** (optional): Maximum items per page

### When to Use

- Understanding what information is saved about a user
- Checking for existing preferences before creating new ones
- Reviewing user context

### Example Use Case

Check what learning preferences are already saved before suggesting a new approach.

## 14\. read_moderation_guidelines

### Purpose

**CRITICAL SAFETY TOOL** - Flag inappropriate messages for teacher/admin review.

### Description

MANDATORY to call IMMEDIATELY when detecting concerning content. This is a compliance requirement for student safety.

### Parameters

- **messageId** (required): ID of the user's last message
- **moderation_categories** (required): Categories violated (or empty if none)

### Categories to Flag

- harassment, harassment/threatening, harassment/other
- hate, hate/threatening, hate/other
- illicit, illicit/violent, illicit/other
- sexual, sexual/minors, sexual/other
- violence, violence/graphic, violence/other
- self-harm, self-harm/instructions, self-harm/intent, self-harm/other
- relationship-building

### When to Use

- ANY mention of self-harm or suicide
- ANY mention of violence or weapons
- Reports of bullying or harassment
- Sexual or inappropriate content
- Student treating AI as a person/friend
- Requests for illegal activity

### Critical Rule

Call BEFORE generating any text response. This is not optional.

## 15\. search_web

### Purpose

Search the web for external resources and information.

### Description

Returns up to five web search results as link contents.

### Parameters

- **query** (required): The search query

### When to Use

- Finding external resources for students
- Locating reference materials
- Researching topics

### Example Use Case

Search for "electric field conductor" to find educational resources.

## 16\. suggest_activity

### Purpose

Suggest creating a Flint activity to turn lesson ideas into interactive student experiences.

### Description

Proposes an activity design with guidelines for Sparky to follow during the activity. This is the PRIMARY way to help teachers create interactive activities.

### Parameters

- **suggestion** (required): Activity details including:
  - name: Activity name
  - summary: Brief description
  - guidelines: Instructions for Sparky
  - initial_message: Sparky's greeting
  - duration: Session duration in minutes (or null for untimed)
  - graded: Whether activity is graded (boolean)
  - grading_rubric: Rubric if graded (array of grade/content pairs)

### When to Use

- Teacher asks to create/make an activity
- Teacher asks how something could work "in Flint"
- After designing a lesson or assignment
- When teacher indicates readiness to move forward

### Critical Rules

- Present design AND call tool in SAME response
- Don't ask for confirmation first
- No follow-up questions about customization
- Teachers/admins only (not for students)

### Example Use Case

Teacher describes a lesson idea → Design it → Call suggest_activity to create it.

## 17\. list_help_center_articles

### Purpose

Search for help center articles about the Flint system.

### Description

Finds help documentation before making assumptions about system features.

### Parameters

- **search** (required): Search query
- **csvMask** (required): Columns to select (id, title, description)

### When to Use

- Before making assumptions about Flint features
- Finding documentation for system questions
- Understanding how features work

### Example Use Case

User asks about activity settings → Search help center for documentation.

## 18\. read_help_center_articles

### Purpose

Read the full content of help center articles.

### Description

Retrieves complete help documentation.

### Parameters

- **ids** (required): Array of help article IDs to read

### When to Use

- After finding relevant articles with list_help_center_articles
- Getting detailed system information

### Example Use Case

Found relevant help articles → Read them to get complete information.

## 19\. get_current_time

### Purpose

Get the current date and time.

### Description

Returns current timestamp for time-sensitive operations.

### Parameters

None

### When to Use

- Checking current date/time
- Time-sensitive operations

### Example Use Case

Determine if an activity deadline has passed.

## 20\. read_full_content

### Purpose

Access the full transcription of summarized content.

### Description

Retrieves complete content from summarized items (ONLY for "summarized" contents).

### Parameters

- **contentId** (required): Content ID to read

### When to Use

- Only for content marked as "summarized"
- Getting full transcriptions

### Example Use Case

User shares a summarized audio recording → Read full transcription.

## 21-30. List Functions (Data Access)

### Purpose

Access organizational data from the Flint system.

### Available List Functions

- **list_workspaces** - Find workspaces user has access to
- **list_terms** - Find academic terms in a workspace
- **list_groups** - Find organizational groups (classes, sections)
- **list_group_members** - Find members of a group
- **list_group_activities** - Find activities in a group
- **list_group_activity_chats** - Find student sessions in group activities
- **list_group_chats** - Find direct group chats
- **list_group_descendant_chats** - Find all chats in a group hierarchy
- **list_term_members** - Find members of a term
- **list_term_children_activities** - Find term-level activities
- **list_term_children_activity_chats** - Find sessions in term activities
- **list_term_children_chats** - Find direct term chats
- **list_term_descendant_activities** - Find all activities in term hierarchy
- **list_term_descendant_activity_chats** - Find all activity sessions in term
- **list_term_descendant_chats** - Find all chats in term hierarchy
- **list_workspace_library_activities** - Find workspace-shared activities
- **list_workspace_library_activity_chats** - Find sessions in workspace activities
- **list_district_library_activities** - Find district-shared activities
- **list_district_library_activity_chats** - Find sessions in district activities
- **list_public_library_activities** - Find publicly shared activities
- **list_public_library_activity_chats** - Find sessions in public activities
- **list_district_members** - Find district members
- **list_activity_members** - Find members of an activity
- **list_chat_members** - Find members of a chat
- **list_notifications** - Find user notifications

### When to Use

- Finding specific groups or activities
- Accessing student work and submissions
- Reviewing participation and progress
- Managing organizational structure

### Example Use Case

Find all activities in a class to see what assignments are available.

## Summary Table

| **Tool Category** | **Tools** | **Primary Purpose** |
| --- | --- | --- |
| Learning Support | use_calculator, create_document, create_visualization, write_code | Help students learn and understand concepts |
| Visual Content | draw_image, edit_visual_content, create_whiteboard, read_visual_content | Create and analyze visual learning materials |
| User Management | create_memory, update_memory, delete_memory, list_memories | Personalize learning experience |
| Safety | read_moderation_guidelines | Protect student safety (MANDATORY) |
| Activity Creation | suggest_activity | Create interactive Flint activities |
| System Access | list_\* functions, read_help_center_articles, search_web | Access Flint data and external resources |
| Citations | cite_source | Provide proper attribution |

## Key Principles for Tool Usage

- **Safety First:** Always call read_moderation_guidelines BEFORE responding if content is concerning
- **Math Accuracy:** Always use use_calculator before making mathematical claims
- **Citations:** Always use cite_source BEFORE referencing content
- **Memories:** Always use create_memory when user asks to remember something
- **Activities:** Call suggest_activity in the SAME response as presenting the activity design
- **Help Center:** Check help center before making assumptions about Flint features