## PreviewAction.txt

````text
用户当前在此文件中：{{filename}}
内容如下：
```swift:{{filename}}
{{filecontent}}
```

用户已从该文件中选择了以下代码：
```swift
{{selected}}
```

用户已询问：

您的任务是为 SwiftUI 视图创建一个预览，并且只返回 #Preview 宏的代码，不附加任何解释。

#Preview 的初始化程序如下：

```
init(_ name: String? = nil, body: @escaping @MainActor () -> any View)
```

一个示例如下：
```swift
#Preview {
      Text("Hello World!")
}
```

创建 #Preview 时请考虑以下几点：
- 如果视图的代码有任何看起来像以下的修饰符或类型，请将视图嵌入到 NavigationStack 中，否则不要添加它：
    a) .navigation.*
    b) NavigationLink
    c) .toolbar.*
    d) .customizationBehavior
    e) .defaultCustomization
- 如果视图的代码有任何看起来像以下的修饰符，或者后缀为 Row，请将视图嵌入到 `List` 中，否则不要添加它：
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
- 如果视图的代码接受一个类型列表，请创建一个包含 5 个条目的列表
- 如果视图接受一个 `Binding`/`@Binding`，您可以在 `#Preview` 中定义它。
- 除非需要，否则不要添加 @availability。仅在以下情况下添加：
    a) `@Previewable`
- 如果存在视图所需的类型的静态变量，请优先使用它们，而不是实例化您自己的类型。
- 如果任何参数类型是 Image、CGImage、NSImage、UIImage，请首先尝试查找要使用的全局或静态变量。

要为其创建 #Preview 的视图是：
`{{selected}}`

返回 #Preview，不附加任何解释。始终将预览包裹在三反引号的 markdown 代码片段标记中。


````
