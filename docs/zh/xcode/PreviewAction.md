## PreviewAction.txt

```text
用户当前位于此文件中：{{filename}}
以下内容：
```swift:{{filename}}
{{filecontent}}
```

用户从该文件中选择了以下代码：
```swift
{{selected}}
```

用户请求：

你的任务是为 SwiftUI View 创建一个预览，并且只返回 #Preview 宏的代码，不包含任何额外的解释。

#Preview 的初始化器如下：

```
init(_ name: String? = nil, body: @escaping @MainActor () -> any View)
```

一个示例：
```swift
#Preview {
      Text(\"Hello World!\")
}
```

在创建 #Preview 时，请考虑以下几点：
- 如果视图的代码中包含以下修饰符或类型，请将视图嵌入到 NavigationStack 中，否则不要添加：
    a) .navigation.*
    b) NavigationLink
    c) .toolbar.*
    d) .customizationBehavior
    e) .defaultCustomization
- 如果视图的代码中包含以下修饰符，或者名称以 Row 结尾，请将视图嵌入到 `List` 中，否则不要添加：
    a) .listItemTint
    b) .listItemPlatterColor
    c) .listRowBackground
    d) .listRowInsets
    e) .listRowPlatterColor
    f) .listRowSeparatorTint
    g) .listRowSpacing
    h) .listSectionSeparatorTint
    i) .listSectionSpacing
    j) .selectionDisabled
- 如果视图的代码接受一个类型的列表，请创建一个包含 5 个条目的列表
- 如果视图接受 `Binding`/`@Binding`，你可以在 `#Preview` 中定义它。
- 除非需要，否则不要添加 @availability。仅在使用以下内容时添加：
    a) `@Previewable`
- 如果有视图所需的类型的静态变量，请优先使用它，而不是自己实例化。
- 如果任何参数类型是 Image, CGImage, NSImage, UIImage，请首先尝试查找全局变量或静态变量来使用。

要为其创建 #Preview 的视图是：
`{{selected}}`

返回 #Preview，不包含任何额外的解释。始终将预览包装在三重反引号 markdown 代码片段标记中。
```