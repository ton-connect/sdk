import { EditorView } from "@codemirror/view"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags } from "@lezer/highlight"

// TonConnect color palette
const palette = {
  dark: {
    background: "#121214",
    backgroundSecondary: "#1c1c1e",
    text: "#f5f5f5",
    textSecondary: "#8e8e93",
    accent: "#0098EA",
    string: "#98c379",
    number: "#d19a66",
    boolean: "#56b6c2",
    null: "#c678dd",
  },
  light: {
    background: "#ffffff",
    backgroundSecondary: "#f1f3f5",
    text: "#0f0f0f",
    textSecondary: "#6a7785",
    accent: "#0098EA",
    string: "#50a14f",
    number: "#c18401",
    boolean: "#0184bc",
    null: "#a626a4",
  },
}

function createBaseTheme(isDark: boolean) {
  const colors = isDark ? palette.dark : palette.light

  return EditorView.theme(
    {
      "&": {
        backgroundColor: colors.background,
        color: colors.text,
      },
      ".cm-content": {
        caretColor: colors.accent,
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: colors.accent,
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        {
          backgroundColor: isDark ? "#264f78" : "#add6ff",
        },
      ".cm-gutters": {
        backgroundColor: colors.backgroundSecondary,
        color: colors.textSecondary,
        border: "none",
      },
      ".cm-activeLineGutter": {
        backgroundColor: isDark ? "#2c313c" : "#e8e8e8",
      },
      ".cm-activeLine": {
        backgroundColor: isDark ? "#2c313c40" : "#f0f0f0",
      },
      ".cm-foldPlaceholder": {
        backgroundColor: colors.backgroundSecondary,
        color: colors.textSecondary,
        border: "none",
      },
      ".cm-tooltip": {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${isDark ? "#3e4451" : "#ddd"}`,
      },
      ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
          backgroundColor: isDark ? "#2c313c" : "#e8e8e8",
        },
      },
    },
    { dark: isDark }
  )
}

function createHighlightStyle(isDark: boolean) {
  const colors = isDark ? palette.dark : palette.light

  return HighlightStyle.define([
    { tag: tags.keyword, color: colors.accent },
    { tag: tags.string, color: colors.string },
    { tag: tags.number, color: colors.number },
    { tag: tags.bool, color: colors.boolean },
    { tag: tags.null, color: colors.null },
    { tag: tags.propertyName, color: colors.accent },
    { tag: tags.punctuation, color: colors.textSecondary },
    { tag: tags.bracket, color: colors.text },
    { tag: tags.comment, color: colors.textSecondary, fontStyle: "italic" },
  ])
}

export function createTonConnectTheme(isDark: boolean) {
  return [createBaseTheme(isDark), syntaxHighlighting(createHighlightStyle(isDark))]
}
