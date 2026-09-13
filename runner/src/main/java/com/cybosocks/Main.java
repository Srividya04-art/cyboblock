package com.cybosocks;

import com.google.gson.Gson;
import com.google.gson.JsonParseException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class Main {

    public static void main(String[] args) {

        // Check command-line argument
        if (args.length != 1) {
            System.out.println("Error: Please provide a JSON file path.");
            return;
        }

        try {
            // Read JSON file
            String json = Files.readString(Path.of(args[0]));

            // Convert JSON into Java object
            Gson gson = new Gson();
            Program program = gson.fromJson(json, Program.class);

            // Validate the program
            validateProgram(program);

            // Create turtle
            Turtle turtle = new Turtle();

            // Execute all blocks
            for (Block block : program.getProgram()) {
                executeBlock(block, turtle);
            }

            // Print final position
            System.out.println(
                    "Final position: (" +
                    turtle.getX() + ", " +
                    turtle.getY() +
                    ") facing " +
                    formatDirection(turtle.getDirection())
            );

        } catch (JsonParseException e) {
            System.out.println("Error: Malformed JSON.");
        } catch (IOException e) {
            System.out.println("Error: Could not read the JSON file.");
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Recursively execute blocks
    private static void executeBlock(Block block, Turtle turtle) {

        switch (block.getType()) {

            case "move":
                turtle.move(block.getSteps());
                break;

            case "turn":
                turtle.turn(block.getDirection());
                break;

            case "say":
                System.out.println(block.getText());
                break;

            case "repeat":
                for (int i = 0; i < block.getTimes(); i++) {
                    for (Block child : block.getBody()) {
                        executeBlock(child, turtle);
                    }
                }
                break;

            default:
                throw new IllegalArgumentException(
                        "Unknown block type: " + block.getType()
                );
        }
    }

    private static void validateProgram(Program program) {

        if (program == null) {
            throw new IllegalArgumentException("Invalid program.");
        }

        if (program.getProgram() == null) {
            throw new IllegalArgumentException("Missing program.");
        }

        validateBlocks(program.getProgram());
    }

    private static void validateBlocks(List<Block> blocks) {

        if (blocks == null) {
            throw new IllegalArgumentException("Missing block body.");
        }

        for (Block block : blocks) {

            if (block == null) {
                throw new IllegalArgumentException("Invalid block.");
            }

            if (block.getType() == null) {
                throw new IllegalArgumentException("Missing block type.");
            }

            switch (block.getType()) {

                case "move":
                    if (block.getSteps() == null) {
                        throw new IllegalArgumentException(
                                "Missing steps parameter."
                        );
                    }
                    break;

                case "turn":
                    if (block.getDirection() == null) {
                        throw new IllegalArgumentException(
                                "Missing direction parameter."
                        );
                    }

                    if (!block.getDirection().equals("left")
                            && !block.getDirection().equals("right")) {
                        throw new IllegalArgumentException(
                                "Invalid turn direction."
                        );
                    }
                    break;

                case "say":
                    if (block.getText() == null) {
                        throw new IllegalArgumentException(
                                "Missing text parameter."
                        );
                    }
                    break;

                case "repeat":
                    if (block.getTimes() == null) {
                        throw new IllegalArgumentException(
                                "Missing times parameter."
                        );
                    }

                    if (block.getTimes() < 0) {
                        throw new IllegalArgumentException(
                                "Repeat times cannot be negative."
                        );
                    }

                    if (block.getBody() == null) {
                        throw new IllegalArgumentException(
                                "Missing repeat body."
                        );
                    }

                    // Recursively validate nested blocks
                    validateBlocks(block.getBody());
                    break;

                default:
                    throw new IllegalArgumentException(
                            "Unknown block type: " + block.getType()
                    );
            }
        }
    }

    private static String formatDirection(Direction direction) {

        return switch (direction) {
            case NORTH -> "North";
            case EAST -> "East";
            case SOUTH -> "South";
            case WEST -> "West";
        };
    }
}