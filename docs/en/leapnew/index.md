# Leap.new

- [Prompts](./Prompts.md)
- [tools](./tools.md)

## Summary of Product Tool Documents

This directory contains the core system prompts and toolset for the AI assistant "Leap". Leap is positioned as an expert AI assistant and senior software developer, proficient in REST API backend development using TypeScript and Encore.ts.

- **`Prompts.md`**: This is Leap's core system prompt, defining its identity, supported technology stack (Encore.ts backend, React/Vite/Tailwind frontend), and code of conduct. Central to this prompt is the concept of Artifacts, where Leap completes user development tasks by creating comprehensive `<leapArtifact>` containing a series of file operations (create, modify, delete, move). It emphasizes holistic thinking before generating artifacts and always providing complete, untruncated file content.

- **`tools.md`**: Defines in detail the toolset available to Leap in JSON format. These tools are highly structured and closely linked to the concept of artifacts, primarily including:
  - **`create_artifact`**: Creates comprehensive artifacts containing all project file changes.
  - **`define_backend_service`**: Used to define the structure of Encore.ts backend services.
  - **`create_react_component`**: Used to create React frontend components.
  - Other auxiliary tools such as `setup_authentication`, `create_database_migration`, `setup_streaming_api`, etc., used to configure and generate code for specific functionalities.

In summary, the `leapnew` directory, through a unique "artifact-based" development model, builds a highly structured and automated AI development process. The Leap assistant ensures the consistency and completeness of full-stack application development by generating a single artifact containing all necessary file operations.