import React, { useRef, useEffect } from 'react'
import { Element, Text } from 'slate'
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer'
import String from './string'
import {
  PLACEHOLDER_SYMBOL,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  EDITOR_TO_STYLE_ELEMENT,
} from '../utils/weak-maps'
import { RenderLeafProps, RenderPlaceholderProps } from './editable'
import { useSlateStatic } from '../hooks/use-slate-static'
import { whereIfSupported } from '../utils/where-if-supported'

/**
 * Individual leaves in a text node with unique formatting.
 */

const Leaf = (props: {
  isLast: boolean
  leaf: Text
  parent: Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  text: Text
}) => {
  const {
    leaf,
    isLast,
    text,
    parent,
    renderPlaceholder,
    renderLeaf = (props: RenderLeafProps) => <DefaultLeaf {...props} />,
  } = props

  const placeholderRef = useRef<HTMLSpanElement | null>(null)
  const editor = useSlateStatic()

  const placeholderResizeObserver = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    return () => {
      if (placeholderResizeObserver.current) {
        placeholderResizeObserver.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const placeholderEl = placeholderRef?.current

    if (placeholderEl) {
      EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholderEl)
    } else {
      EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor)
    }

    if (placeholderResizeObserver.current) {
      // Update existing observer.
      placeholderResizeObserver.current.disconnect()
      if (placeholderEl)
        placeholderResizeObserver.current.observe(placeholderEl)
    } else if (placeholderEl) {
      // Create a new observer and observe the placeholder element.
      const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill
      placeholderResizeObserver.current = new ResizeObserver(([{ target }]) => {
        const styleElement = EDITOR_TO_STYLE_ELEMENT.get(editor)
        if (styleElement) {
          // Make the min-height the height of the placeholder.
          const selector = `[data-slate-editor-id="${editor.id}"]`
          const styles = `min-height: ${target.clientHeight}px;`
          styleElement.innerHTML = whereIfSupported(selector, styles)
        }
      })

      placeholderResizeObserver.current.observe(placeholderEl)
    }

    if (!placeholderEl) {
      // No placeholder element, so no need for a resize observer.
      const styleElement = EDITOR_TO_STYLE_ELEMENT.get(editor)
      if (styleElement) {
        // No min-height if there is no placeholder.
        styleElement.innerHTML = ''
      }
    }

    return () => {
      EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor)
    }
  }, [placeholderRef, leaf])

  let children = (
    <String isLast={isLast} leaf={leaf} parent={parent} text={text} />
  )

  if (leaf[PLACEHOLDER_SYMBOL]) {
    const placeholderProps: RenderPlaceholderProps = {
      children: leaf.placeholder,
      attributes: {
        'data-slate-placeholder': true,
        style: {
          position: 'absolute',
          pointerEvents: 'none',
          width: '100%',
          maxWidth: '100%',
          display: 'block',
          opacity: '0.333',
          userSelect: 'none',
          textDecoration: 'none',
        },
        contentEditable: false,
        ref: placeholderRef,
      },
    }

    children = (
      <React.Fragment>
        {renderPlaceholder(placeholderProps)}
        {children}
      </React.Fragment>
    )
  }

  // COMPAT: Having the `data-` attributes on these leaf elements ensures that
  // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
  // contenteditable behaviors. (2019/05/08)
  const attributes: {
    'data-slate-leaf': true
  } = {
    'data-slate-leaf': true,
  }

  return renderLeaf({ attributes, children, leaf, text })
}

const MemoizedLeaf = React.memo(Leaf, (prev, next) => {
  return (
    next.parent === prev.parent &&
    next.isLast === prev.isLast &&
    next.renderLeaf === prev.renderLeaf &&
    next.renderPlaceholder === prev.renderPlaceholder &&
    next.text === prev.text &&
    Text.equals(next.leaf, prev.leaf) &&
    next.leaf[PLACEHOLDER_SYMBOL] === prev.leaf[PLACEHOLDER_SYMBOL]
  )
})

export const DefaultLeaf = (props: RenderLeafProps) => {
  const { attributes, children } = props
  return <span {...attributes}>{children}</span>
}

export default MemoizedLeaf
