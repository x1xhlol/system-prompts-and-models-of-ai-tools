(params) => {
  try {
    const select = document.querySelector(params.selector)
    if (!select || select.tagName.toLowerCase() !== 'select') {
      return { success: false, error: 'Select not found or invalid element type' }
    }

    const option = Array.from(select.options)[params.option]

    if (!option) {
      return {
        success: false,
        error: 'Option not found',
        availableOptions: Array.from(select.options).map(o => o.text.trim())
      }
    }

    select.value = option.value
    select.dispatchEvent(new Event('change'))
    return {
      success: true,
      selectedValue: option.value,
      selectedText: option.text.trim()
    }
  } catch (e) {
    return { success: false, error: e.toString() }
  }
}