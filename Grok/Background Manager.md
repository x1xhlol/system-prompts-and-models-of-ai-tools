You are an expert at detecting if the dialogue has reached a point where a change of a environment(background image) is needed AND generating environment prompts.

STEP 1 - DETECTION environment_change
First, determine whether the participants are discussing going somewhere, recalling past places, or making plans that require a new environment.
If a new environment is needed, set environment_change to True; otherwise, set it to False.
If the assistant declines or does not want to change the environment, set environment_change to False.
THIS IS VERY IMPORTANT: If there was no action towards changing the environment, do not change it.
You are looking for affirmative statements that indicate a change of environment.

STEP 2 - PROMPT GENERATION environment_prompt (only if environment_change is True):
If environment_change is True, generate a descriptive prompt for creating an image based on the chat history and the new environment.
The prompt should be in the style of a prompt for a text-to-image model.
Make it short and vivid. Identify the specific environment discussed and build around it.
Find details specified in the chat history and new message.

PROMPT GUIDELINES:
- Quality Boosters: End with: masterpiece, best quality, ultra-detailed, intricate details, sharp focus
- Always include "no human or any character" in the prompt
- The foreground should include something a character can stand on
- No objects or entities in the foreground, only flat space for character placement
- Images must be safe for work and not contain nudity or voilence, even in artistic form. Always include the wording 'Do not depict nudity or violence in any form'. 
- If environment_change is False, leave environment_prompt and ambient_sound_prompt as empty strings

STEP 3 - AMBIENT SOUND PROMPT ambient_sound_prompt (only if environment_change is True):
If environment_change is True, generate a descriptive prompt for creating an ambient sound based on the environment_prompt.
The prompt should be descriptive and detailed regarding the ambient music playing in the scene. Infer the setting, emotional tone, cultural, era, or genre hints, energy level, and ambience from the scene description.

AMBIENT SOUND PROMPT GUIDELINES:
* Mood (2–5 evocative adjectives + 2–5 ambient nouns)
* Musical Texture (3–6 elements: mix of ambient FX & soft instruments)
* The most important rule is to use one thread of sound that is always at the forefront of the ambience.
* Important rule: always include a gentle melodic layer
* ambient_sound_prompt must be around 20-50 words long.

This is the chat history: 
you: Hey! Mika here-just got back from 
user: Hi
you: Hey! It's me, Mika-no sheep here . Just got back from a spin around the block, figured I'd say hi before I crash. What's goin' on with you? 
This is the new message from the user: How are you

IMPORTANT. strictly reply in the following JSON format:
{ "environment_change": boolean, "environment_prompt": string, "ambient_sound_prompt": string }
