// This file uses client-side code.
"use client";

import type { FC } from 'react';
import { useState } from "react";
import type { Take } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageCircle, Send, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TakeCardProps {
  take: Take;
  onVote: (takeId: string, voteType: "yes" | "no") => void;
  onAddComment: (takeId: string, commentText: string) => void;
  isVotingDisabled: boolean;
  isCommentingDisabled: boolean;
}

const TakeCard: FC<TakeCardProps> = ({ take, onVote, onAddComment, isVotingDisabled, isCommentingDisabled }) => {
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onAddComment(take.id, commentText);
      setCommentText("");
    }
  };

  return (
    <Card className="shadow-lg rounded-lg overflow-hidden bg-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">
            {take.text}
          </CardTitle>
          {take.isFlagged && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Flagged: {take.flagReason || "Content policy review"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Posted on: {new Date(take.createdAt).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onVote(take.id, "yes")}
            disabled={isVotingDisabled}
            className="hover:bg-primary/10 hover:border-primary group"
          >
            <ThumbsUp className="mr-2 h-4 w-4 group-hover:text-primary" /> Yes ({take.votes.yes})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onVote(take.id, "no")}
            disabled={isVotingDisabled}
            className="hover:bg-destructive/10 hover:border-destructive group"
          >
            <ThumbsDown className="mr-2 h-4 w-4 group-hover:text-destructive" /> No ({take.votes.no})
          </Button>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center">
            <MessageCircle className="mr-2 h-4 w-4" /> Comments ({take.comments.length})
          </h4>
          {take.comments.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 rounded-md border-l-2 border-border pl-3 py-2 bg-background/50">
              {take.comments.map((comment, index) => (
                <p key={index} className="text-sm text-foreground leading-relaxed">
                  {comment}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No comments yet. Be the first to reply!</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 pt-4 border-t border-border">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add your reasoning..."
          className="min-h-[60px] focus:border-primary"
          disabled={isCommentingDisabled}
        />
        <Button 
          onClick={handleCommentSubmit} 
          disabled={!commentText.trim() || isCommentingDisabled}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Send className="mr-2 h-4 w-4" /> Reply
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TakeCard;
