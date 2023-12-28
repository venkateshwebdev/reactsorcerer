import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

const customStyleMap = {
  RED_TEXT: {
    color: "red",
  },
};

const MyEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [currentMarkup, setCurrentMarkup] = useState("");
  const [isNewLine, setIsNewLine] = useState(true);

  useEffect(() => {
    // Load content from localStorage on component mount
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleSave = () => {
    // Save content to localStorage
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContent));
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const removeMarkupSymbol = () => {
    const selection = editorState.getSelection();
    const charactersToDelete = 5;
    const newSelection = selection.merge({
      anchorOffset: Math.max(
        0,
        selection.getStartOffset() - charactersToDelete
      ),
      focusOffset: selection.getStartOffset(),
    });
    const contentWithDeletion = Modifier.removeRange(
      editorState.getCurrentContent(),
      newSelection,
      "backward"
    );
    const editorStateWithDeletion = EditorState.push(
      editorState,
      contentWithDeletion,
      "remove-range"
    );

    return editorStateWithDeletion;
  };

  const handleBeforeInput = (char) => {
    if (char === "*" || char === "#") {
      if (isNewLine) {
        setCurrentMarkup((prev) => prev + char);
      }
    } else if (char === " ") {
      if (isNewLine) {
        // Remove the content before the space. i.e the markup.
        const editorState = removeMarkupSymbol();
        let currentEditorState = editorState;
        // apply markup.
        if (currentMarkup === "#") {
          currentEditorState = RichUtils.toggleBlockType(
            editorState,
            "header-one"
          );
        } else if (currentMarkup === "*") {
          currentEditorState = RichUtils.toggleInlineStyle(editorState, "BOLD");
        } else if (currentMarkup === "**") {
          currentEditorState = RichUtils.toggleInlineStyle(
            editorState,
            "RED_TEXT"
          );
        } else if (currentMarkup === "***") {
          currentEditorState = RichUtils.toggleInlineStyle(
            editorState,
            "UNDERLINE"
          );
        }
        setEditorState(currentEditorState);
        setCurrentMarkup("");
        return "handled";
      }
      setIsNewLine(false);
    } else {
      setIsNewLine(false);
    }
    return "not-handled";
  };

  const handleReturn = (e) => {
    setIsNewLine(true);
    setCurrentMarkup("");
    return "not-handled";
  };

  return (
    <div>
      <div className="header">
        <h3>Demo editor by Venkatesh Sirigineedi</h3>
        <button onClick={handleSave}>Save</button>
      </div>
      <div>
        <h4>
          To apply the formats type #, *, **, *** in the beginning of the new
          line
        </h4>
        <h4>
          To unapply the formats again type #, *, **, *** in the beginning of
          the new line
        </h4>
      </div>
      <div
        style={{ border: "1px solid blue", padding: "16px", margin: "24px" }}
      >
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          handleReturn={handleReturn}
          customStyleMap={customStyleMap}
          onChange={setEditorState}
        />
      </div>
    </div>
  );
};

export default MyEditor;
