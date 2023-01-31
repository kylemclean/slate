import { createContext, useContext } from 'react'
import { Editor } from 'slate'
import { ReactEditor } from '../plugin/react-editor'

/**
 * A React context for sharing the editor object, in a way that re-renders the
 * context whenever changes occur.
 */

export interface SlateContextValue {
  v: number
  editor: ReactEditor
  cspNonce?: string
}

export const SlateContext = createContext<SlateContextValue | null>(null)

const getContext = (): SlateContextValue => {
  const context = useContext(SlateContext)

  if (!context) {
    throw new Error(
      `The \`useSlate\` hook must be used inside the <Slate> component's context.`
    )
  }

  return context
}

/**
 * Get the current editor object from the React context.
 */

export const useSlate = (): Editor => getContext().editor

export const useSlateWithV = (): { editor: Editor; v: number } => {
  const { editor, v } = getContext()
  return { editor, v }
}

export const useSlateWithCspNonce = (): {
  editor: Editor
  cspNonce?: string
} => {
  const { editor, cspNonce } = getContext()
  return { editor, cspNonce }
}
