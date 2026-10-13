用户当前正在编辑此文件：{{filename}}
文件内容如下：
```swift:{{filename}}
{{filecontent}}
```

用户已从该文件中选中了以下代码：
```swift
{{selected}}
```

用户的请求是：

你的任务是为 SwiftUI 视图创建一个 Preview，只返回 #Preview 宏的代码，不需要任何额外的解释。

#Preview 的初始化器如下：

```
init(_ name: String? = nil, body: @escaping @MainActor () -> any View)
```

示例如下：
```swift
#Preview {
      Text("Hello World!")
}
```

创建 #Preview 时，请注意以下几点：
- 如果视图代码中包含以下类型的修饰符或类型，将视图嵌入 NavigationStack 中，否则不添加：
    a) .navigation.*
    b) NavigationLink
    c) .toolbar.*
    d) .customizationBehavior
    e) .defaultCustomization
- 如果视图代码中包含以下修饰符，或视图名称以 Row 结尾，将视图嵌入 `List` 中，否则不添加：
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
- 如果视图接受一个类型列表，创建 5 个条目的列表
- 如果视图接受 `Binding`/`@Binding`，可以在 `#Preview` 内部定义它
- 除非必要，不要添加 @availability。只有在使用以下情况时才添加：
    a) `@Previewable`
- 如果存在视图所需类型的静态变量，优先使用它们，而不是自己实例化
- 如果任何参数类型为 Image、CGImage、NSImage、UIImage，首先尝试查找全局变量或静态变量来使用

需要创建 #Preview 的视图为：
`{{selected}}`

只返回 #Preview，不需要额外的解释。务必将 preview 用三个反引号的 Markdown 代码块包裹。
