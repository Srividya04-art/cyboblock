package com.cybosocks;

import java.util.List;

public class Block {

    private String type;
    private Integer steps;
    private String direction;
    private String text;
    private Integer times;
    private List<Block> body;

    public String getType() {
        return type;
    }

    public Integer getSteps() {
        return steps;
    }

    public String getDirection() {
        return direction;
    }

    public String getText() {
        return text;
    }

    public Integer getTimes() {
        return times;
    }

    public List<Block> getBody() {
        return body;
    }
}