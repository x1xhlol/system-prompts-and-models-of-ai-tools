# 🔍 How to Extract AI Tool Prompts

*A comprehensive guide to discovering and documenting system prompts from AI coding tools*

---

## 📋 Overview

This guide explains ethical methods for obtaining system prompts from AI coding assistants. We prioritize:
- ✅ **Legal methods** - Public sources, official documentation
- ✅ **Ethical practices** - Respect for intellectual property
- ✅ **Transparency** - Clear source attribution
- ❌ **No unauthorized access** - No hacking or ToS violations

---

## 🎯 Method 1: Official Documentation

**Difficulty:** Easy  
**Reliability:** High  
**Legality:** ✅ Completely legal

### Sources:

1. **Official GitHub Repositories**
   - Many tools are open source
   - Prompts in code or config files
   - Example: Bolt, Cline, RooCode

2. **Documentation Sites**
   - Some vendors publish prompts
   - API documentation
   - Developer guides

3. **Blog Posts & Announcements**
   - Launch announcements
   - Technical deep dives
   - Behind-the-scenes posts

### How to Find:

```bash
# Search GitHub
site:github.com "system prompt" OR "system instructions" [tool name]

# Search documentation
site:[tool-domain.com] "prompt" OR "instructions"

# Search for technical posts
[tool name] "system prompt" blog
```

### Example:
- **Anthropic Claude:** Published in API docs
- **Bolt.new:** Open source on GitHub
- **Cline:** Full system prompt in repository

---

## 🎯 Method 2: Browser Developer Tools

**Difficulty:** Medium  
**Reliability:** High  
**Legality:** ✅ Legal (for tools you have access to)

### For Web-Based Tools (v0, Bolt, Replit, etc.):

**Step 1: Open Developer Tools**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Step 2: Go to Network Tab**
- Clear existing requests (🚫 icon)
- Start recording

**Step 3: Trigger AI Request**
- Ask the AI a question
- Request code generation
- Start a new chat

**Step 4: Find API Calls**
- Look for requests to:
  - `/api/chat`
  - `/v1/messages`
  - `/completions`
  - OpenAI/Anthropic endpoints

**Step 5: Inspect Request Payload**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "This is the system prompt..." // <-- Here!
    },
    {
      "role": "user",
      "content": "User message"
    }
  ]
}
```

**Step 6: Copy System Prompt**
- Click on the request
- Go to "Payload" or "Request" tab
- Find the `system` message
- Copy the content

### Screenshot Guidance:
```
Network Tab → Select API Call → Payload
└── Look for: "role": "system"
    └── Copy: "content": "..."
```

---

## 🎯 Method 3: IDE Extension Inspection

**Difficulty:** Medium-Hard  
**Reliability:** High  
**Legality:** ✅ Legal (for extensions you've installed)

### For VS Code Extensions (Cursor, Copilot, etc.):

**Method A: Extension Files (Windows)**

1. **Find Extension Directory:**
   ```powershell
   # VS Code extensions
   cd $env:USERPROFILE\.vscode\extensions
   
   # Cursor extensions
   cd $env:USERPROFILE\.cursor\extensions
   ```

2. **List Installed Extensions:**
   ```powershell
   Get-ChildItem -Directory
   ```

3. **Search for Prompts:**
   ```powershell
   # Search all JS files for "system" or "prompt"
   Get-ChildItem -Recurse -Filter "*.js" | Select-String -Pattern "system.*prompt|You are|Your role"
   ```

4. **Common Locations:**
   - `extension.js`
   - `out/extension.js`
   - `dist/extension.js`
   - `prompts/system.txt`

**Method B: Runtime Inspection**

1. **Open Extension Host DevTools:**
   - VS Code: `Ctrl+Shift+P` → "Developer: Toggle Developer Tools"
   - Look for "Extension Host" console

2. **Inspect Network Requests:**
   - Same as browser method
   - Look for API calls to AI providers

3. **Search Memory (Advanced):**
   - Use Chrome DevTools memory profiler
   - Search for string patterns

### For JetBrains IDEs:

1. **Find Plugin Directory:**
   ```bash
   # Linux/Mac
   ~/.config/JetBrains/[IDE]/plugins/
   
   # Windows
   %APPDATA%\JetBrains\[IDE]\plugins\
   ```

2. **Search JAR Files:**
   ```bash
   # Extract and search
   unzip plugin.jar -d temp/
   grep -r "system prompt" temp/
   ```

---

## 🎯 Method 4: API Documentation

**Difficulty:** Easy-Medium  
**Reliability:** High  
**Legality:** ✅ Completely legal

### For API-Based Tools:

1. **Read Official API Docs:**
   - OpenAI API documentation
   - Anthropic API documentation
   - Tool-specific APIs

2. **Look for Example Requests:**
   - Usually include system messages
   - May show recommended prompts

3. **Check SDKs:**
   ```python
   # Example: Python SDK might include prompts
   import tool_sdk
   print(tool_sdk.DEFAULT_SYSTEM_PROMPT)
   ```

### Examples:
- **Claude API:** Shows system prompt structure
- **OpenAI API:** Example system messages
- **Tool SDKs:** Often include default prompts

---

## 🎯 Method 5: Community Sharing

**Difficulty:** Easy  
**Reliability:** Medium  
**Legality:** ✅ Legal (shared willingly)

### Sources:

1. **Discord Servers:**
   - Tool-specific servers
   - AI development communities
   - Developer channels

2. **Reddit:**
   - r/OpenAI
   - r/LocalLLaMA
   - r/ClaudeAI
   - r/coding

3. **Twitter/X:**
   - Developers sharing findings
   - Tool announcements
   - Technical threads

4. **GitHub Discussions:**
   - Tool repositories
   - Community Q&A

5. **Blog Posts:**
   - Technical breakdowns
   - Reverse engineering writeups

### How to Search:
```
# Discord
Search: "system prompt" OR "system instructions"

# Reddit
site:reddit.com [tool name] "system prompt"

# Twitter
from:@[developer] "system prompt"
```

---

## 🎯 Method 6: Packet Capture (Advanced)

**Difficulty:** Hard  
**Reliability:** High  
**Legality:** ⚠️ Only for tools you own/have access to

### Using Wireshark/mitmproxy:

**Warning:** Only use this method for tools you have legitimate access to.

**Step 1: Install mitmproxy**
```bash
pip install mitmproxy
```

**Step 2: Configure Tool to Use Proxy**
```bash
# Set environment variables
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
```

**Step 3: Start mitmproxy**
```bash
mitmproxy
```

**Step 4: Use Tool**
- Make AI requests
- Watch for API calls in mitmproxy

**Step 5: Inspect Traffic**
- Look for JSON payloads
- Find system messages

---

## ✅ Verification & Validation

### After Extracting a Prompt:

1. **Test It:**
   - Use with API directly
   - Verify behavior matches tool
   - Check for completeness

2. **Check Version:**
   - Note extraction date
   - Look for version indicators
   - Track changes over time

3. **Validate Completeness:**
   - Is it the full prompt?
   - Are there multiple parts?
   - Any missing context?

4. **Document Source:**
   - Where you found it
   - When you extracted it
   - Method used
   - Any modifications

---

## 📝 Documentation Template

When documenting extracted prompts:

```markdown
# [Tool Name] System Prompt

**Version:** [version or date]
**Source:** [method + URL/location]
**Extracted:** [YYYY-MM-DD]
**Extracted By:** [your name/handle]
**Validation:** [tested/verified/partial]

---

## Extraction Method

[Describe how you obtained this prompt]

## Validation

[How you verified accuracy]

## Notes

[Any caveats, incompleteness, etc.]

---

[ACTUAL PROMPT CONTENT]
```

---

## ⚖️ Legal & Ethical Considerations

### ✅ DO:
- Use tools you have legitimate access to
- Respect terms of service
- Document sources clearly
- Share for educational purposes
- Attribute properly
- Ask permission when possible

### ❌ DON'T:
- Hack or unauthorized access
- Violate terms of service
- Share confidential information
- Steal proprietary data
- Misrepresent source
- Use for commercial harm

### Gray Areas:
- **Reverse engineering for personal use:** Generally legal
- **Sharing publicly:** Depends on ToS and jurisdiction
- **Educational purposes:** Usually protected (fair use)
- **Commercial use:** More legally risky

**When in doubt:** Consult legal counsel or don't share publicly.

---

## 🔧 Tools & Software

### Recommended Tools:

**Browser:**
- **Chrome/Edge DevTools** - Best for web tools
- **Firefox Developer Tools** - Alternative

**Network:**
- **mitmproxy** - HTTPS proxy inspection
- **Wireshark** - Packet capture (advanced)
- **Charles Proxy** - GUI-based proxy

**File Search:**
- **grep** (Linux/Mac) - Search text files
- **ripgrep** - Fast search
- **Select-String** (PowerShell) - Windows search

**Code Analysis:**
- **VS Code** - View extension files
- **jadx** - Decompile Android apps (for mobile tools)
- **JD-GUI** - Java decompiler

---

## 📊 Success Rates by Method

| Method | Success Rate | Difficulty | Time Required |
|--------|--------------|------------|---------------|
| Official Docs | 30% | Easy | 5 min |
| Browser DevTools | 80% | Medium | 10 min |
| Extension Inspection | 70% | Medium | 20 min |
| API Docs | 40% | Easy | 10 min |
| Community Sharing | 50% | Easy | Variable |
| Packet Capture | 90% | Hard | 30 min |

---

## 🎓 Example Walkthroughs

### Example 1: Extracting from Web Tool

**Tool:** v0 by Vercel  
**Method:** Browser DevTools

1. Open https://v0.dev
2. Press F12 (DevTools)
3. Network tab → Filter: Fetch/XHR
4. Ask v0 to generate code
5. Find POST request to `/api/...`
6. Click request → Payload tab
7. Look for `system` or `instructions`
8. Copy content
9. Format and document

**Result:** System prompt extracted in ~5 minutes

---

### Example 2: Extracting from VS Code Extension

**Tool:** Cursor (VS Code fork)  
**Method:** Extension file inspection

1. Navigate to extensions directory
2. Find Cursor extension folder
3. Search for `.js` files containing "system"
4. Open `extension.js` in editor
5. Search for prompt patterns
6. Extract and clean up
7. Verify with actual tool behavior

**Result:** Prompt found in ~15 minutes

---

## 🔍 Common Patterns to Search For

When searching files, look for:

```javascript
// Common patterns
"You are a helpful"
"You are an AI"
"Your role is to"
"system prompt"
"system_prompt"
"systemMessage"
"SYSTEM_PROMPT"
"instructions"
"<system>"
```

---

## 🚨 Red Flags

**Stop if you encounter:**
- ❌ Encrypted/obfuscated prompts (don't decrypt)
- ❌ Clear ToS violations
- ❌ Security warnings
- ❌ Authentication bypasses required
- ❌ Proprietary markings (confidential, internal, etc.)

---

## 📚 Additional Resources

- **OpenAI Cookbook:** Prompt engineering examples
- **Anthropic Documentation:** Claude best practices
- **Awesome Prompts:** Community-curated prompts
- **PromptBase:** Commercial prompt marketplace
- **GitHub Topics:** #prompt-engineering

---

## 🤝 Contributing Your Findings

Found a prompt? Share it!

1. **Check MISSING_TOOLS.md** - Is it on our list?
2. **Document properly** - Use the template above
3. **Create pull request** - Follow [CONTRIBUTING.md](./CONTRIBUTING.md)
4. **Join discussion** - Discord/GitHub Discussions

---

## ❓ FAQ

**Q: Is this legal?**  
A: Methods 1-5 are generally legal. Method 6 requires caution. Always respect ToS.

**Q: Can I share extracted prompts publicly?**  
A: Depends on the source and ToS. Educational use is usually fair use.

**Q: What if the tool is closed source?**  
A: Methods 2-6 may work, but verify legality first.

**Q: How do I know if I have the complete prompt?**  
A: Test it with the API and compare behavior to the actual tool.

**Q: Can companies change prompts after I extract them?**  
A: Yes! Always document the version/date.

---

## 📞 Need Help?

- **GitHub Issues:** Ask questions
- **Discord:** Real-time help
- **Discussions:** Long-form questions

---

*Last Updated: 2025-01-02*  
*This guide is for educational purposes only.*  
*Always respect intellectual property and terms of service.*
