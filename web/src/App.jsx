import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import "./App.css";

function App() {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);

  const [jsonOutput, setJsonOutput] = useState({
    program: [],
  });

  useEffect(() => {
    // =====================================================
    // 1. MOVE BLOCK
    // =====================================================
    Blockly.Blocks["turtle_move"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("MOVE")
          .appendField(
            new Blockly.FieldNumber(1, 0),
            "STEPS"
          )
          .appendField("STEPS");

        this.setPreviousStatement(true);
        this.setNextStatement(true);

        this.setColour(160);
        this.setTooltip("Move the turtle forward.");
      },
    };

    // =====================================================
    // 2. TURN BLOCK
    // =====================================================
    Blockly.Blocks["turtle_turn"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("TURN")
          .appendField(
            new Blockly.FieldDropdown([
              ["LEFT", "left"],
              ["RIGHT", "right"],
            ]),
            "DIRECTION"
          );

        this.setPreviousStatement(true);
        this.setNextStatement(true);

        this.setColour(210);
        this.setTooltip("Turn the turtle 90 degrees.");
      },
    };

    // =====================================================
    // 3. SAY BLOCK
    // =====================================================
    Blockly.Blocks["turtle_say"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("SAY")
          .appendField(
            new Blockly.FieldTextInput("Hello"),
            "TEXT"
          );

        this.setPreviousStatement(true);
        this.setNextStatement(true);

        this.setColour(60);
        this.setTooltip("Make the turtle say something.");
      },
    };

    // =====================================================
    // 4. REPEAT BLOCK
    // =====================================================
    Blockly.Blocks["turtle_repeat"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("REPEAT")
          .appendField(
            new Blockly.FieldNumber(2, 0),
            "TIMES"
          )
          .appendField("TIMES");

        // Allows other blocks to be placed inside
        this.appendStatementInput("BODY")
          .appendField("DO");

        this.setPreviousStatement(true);
        this.setNextStatement(true);

        this.setColour(120);
        this.setTooltip("Repeat the blocks inside.");
      },
    };

    // =====================================================
    // TOOLBOX
    // =====================================================
    const toolbox = {
      kind: "flyoutToolbox",
      contents: [
        {
          kind: "block",
          type: "turtle_move",
        },
        {
          kind: "block",
          type: "turtle_turn",
        },
        {
          kind: "block",
          type: "turtle_say",
        },
        {
          kind: "block",
          type: "turtle_repeat",
        },
      ],
    };

    // =====================================================
    // CREATE WORKSPACE
    // =====================================================
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      scrollbars: true,
      trashcan: true,
    });

    workspaceRef.current = workspace;

    // =====================================================
    // RECURSIVE BLOCK → JSON CONVERSION
    // =====================================================
    function generateBlock(block) {
      // ---------------- MOVE ----------------
      if (block.type === "turtle_move") {
        return {
          type: "move",
          steps: Number(block.getFieldValue("STEPS")),
        };
      }

      // ---------------- TURN ----------------
      if (block.type === "turtle_turn") {
        return {
          type: "turn",
          direction: block.getFieldValue("DIRECTION"),
        };
      }

      // ---------------- SAY ----------------
      if (block.type === "turtle_say") {
        return {
          type: "say",
          text: block.getFieldValue("TEXT"),
        };
      }

      // ---------------- REPEAT ----------------
      if (block.type === "turtle_repeat") {
        const body = [];

        // Get the first block inside BODY
        let child = block.getInputTargetBlock("BODY");

        // Walk through all blocks inside the repeat
        while (child) {
          // IMPORTANT:
          // Calling generateBlock() again makes this recursive.
          body.push(generateBlock(child));

          child = child.getNextBlock();
        }

        return {
          type: "repeat",
          times: Number(block.getFieldValue("TIMES")),
          body: body,
        };
      }

      // Unknown block
      return null;
    }

    // =====================================================
    // GENERATE COMPLETE PROGRAM
    // =====================================================
    function generateProgram() {
      const topBlocks = workspace.getTopBlocks(true);

      const program = [];

      topBlocks.forEach((block) => {
        const result = generateBlock(block);

        if (result !== null) {
          program.push(result);
        }
      });

      return {
        program,
      };
    }

    // =====================================================
    // UPDATE JSON WHEN BLOCKS CHANGE
    // =====================================================
    const changeListener = () => {
      const result = generateProgram();
      setJsonOutput(result);
    };

    workspace.addChangeListener(changeListener);

    // Generate initial JSON
    setJsonOutput(generateProgram());

    // =====================================================
    // CLEANUP
    // =====================================================
    return () => {
      workspace.dispose();
    };
  }, []);

  // =======================================================
  // COPY JSON
  // =======================================================
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(jsonOutput, null, 2)
      );

      alert("JSON copied!");
    } catch (error) {
      console.error("Failed to copy JSON:", error);
    }
  };

  // =======================================================
  // UI
  // =======================================================
  return (
    <div className="app">

      <h1>🐢 Turtle Block Editor</h1>

      <div className="editor-container">

        {/* Blockly Workspace */}
        <div
          ref={blocklyDiv}
          className="blockly-workspace"
        ></div>

        {/* JSON Panel */}
        <div className="json-panel">

          <div className="json-header">
            <h2>Generated JSON</h2>

            <button onClick={copyJson}>
              Copy JSON
            </button>
          </div>

          <pre>
            {JSON.stringify(jsonOutput, null, 2)}
          </pre>

        </div>

      </div>
    </div>
  );
}

export default App;