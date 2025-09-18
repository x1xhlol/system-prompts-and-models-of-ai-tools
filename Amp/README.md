# How to obtain the system prompt for [Amp](https://ampcode.com)

1. Login with Amp using VScode
2. Issue a short query into Amp
3. Hold down Alt (windows) or Option (macOS) and click on the workspace button

![](./view-thread-yaml.png)

4. Click view Thread YAML

# Notes

The system prompt used by Amp is tuned to Sonnet 4.x and has other LLMs registered into it as tools ("the oracle"). To obtain the `GPT-5` tuned system prompt then you need to configure VSCode user settings with the following and then follow the steps above again

```json
{
    "amp.url": "https://ampcode.com/",
    "amp.gpt5": true
}
```
