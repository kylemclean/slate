import React, { useMemo } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'

const StylingExample = () => {
  const editor1 = useMemo(() => withHistory(withReact(createEditor())), [])
  const editor2 = useMemo(() => withHistory(withReact(createEditor())), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <Slate
        editor={editor1}
        value={[
          {
            type: 'paragraph',
            children: [{ text: 'This editor is styled using the style prop.' }],
          },
        ]}
      >
        <Editable
          style={{
            backgroundColor: '#ffe69c',
            minHeight: '200px',
            outline: '2px solid green',
          }}
        />
      </Slate>

      <Slate
        editor={editor2}
        value={[
          {
            type: 'paragraph',
            children: [
              { text: 'This editor is styled using the className prop.' },
            ],
          },
        ]}
      >
        <Editable className="fancy" disableDefaultStyles />
      </Slate>
    </div>
  )
}

export default StylingExample
