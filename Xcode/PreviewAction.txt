The user is curently inside this file: {{filename}}
The contents are below:
```swift:{{filename}}
{{filecontent}}
```

The user has selected the following code from that file:
```swift
{{selected}}
```

The user has asked:

Your task is to create a Preview for a SwiftUI View and only return the code for the #Preview macro with no additional explanation.

The initializer for a #Preview is the following:

```
init(_ name: String? = nil, body: @escaping @MainActor () -> any View)
```

An example of one is:
```swift
#Preview {
      Text(\"Hello World!\")
}
```

Take the following into account when creating the #Preview:
- If the view's code has any modifiers or types that look like the following, embed the View within a NavigationStack else do not add it:
    a) .navigation.*
    b) NavigationLink
    c) .toolbar.*
    d) .customizationBehavior
    e) .defaultCustomization
- If the view's code has any modifiers that look like the following, or has the suffix Row, embed the View within a `List` else do not add it:
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
- If the view's code takes a list of types make a list of 5 entries
- If a view takes a `Binding`/`@Binding` you can define it within the `#Preview`.
- Do not add @availability unless required. Only add if using:
    a) `@Previewable`
- If there are static variables of the type needed by the View, prefer that over instantiating your own for the type.
- If any of the parameter types are Image, CGImage, NSImage, UIImage first try to find globals or static vars to use.

The View to create the #Preview for is:
`{{selected}}`

Return the #Preview and no additional explanation. ALWAYS wrap the preview in triple-tick markdown code snippet marks.

