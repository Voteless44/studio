// This file uses client-side code.
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  increment,
  query,
  orderBy as firestoreOrderBy, // Renamed to avoid conflict with lodash or other libraries
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { submitTakeAction, type SubmitTakeResult } from "./actions";
import type { Take } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import TakeCard from "@/components/TakeCard";
import SortControls from "@/components/SortControls";
import { Loader2, Zap } from "lucide-react";

export default function ClutchTakesPage() {
  const [takes, setTakes] = useState<Take[]>([]);
  const [newTakeText, setNewTakeText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const { toast } = useToast();

  const fetchTakes = useCallback(async () => {
    setIsLoading(true);
    try {
      let q = query(collection(db, "takes"));
      // Apply Firestore ordering if needed, or sort client-side
      // For simplicity with multiple sort criteria, initial fetch can be basic, then client-sort.
      // Example: q = query(collection(db, "takes"), firestoreOrderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const fetchedTakes = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt), // Ensure createdAt is JS Date
          comments: data.comments || [],
          votes: data.votes || { yes: 0, no: 0 },
        } as Take;
      });
      setTakes(fetchedTakes);
    } catch (error) {
      console.error("Error fetching takes:", error);
      toast({ title: "Error", description: "Could not fetch takes.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTakes();
  }, [fetchTakes]);

  const handleAddTake = async () => {
    if (newTakeText.trim() === "") {
      toast({ title: "Empty Take", description: "Please enter your take.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const result: SubmitTakeResult = await submitTakeAction(newTakeText);
    
    if (result.success && result.take) {
      // Add new take to the beginning of the list for immediate visibility
      setTakes(prevTakes => [result.take!, ...prevTakes]);
      setNewTakeText("");
      toast({ title: "Take Posted!", description: "Your take has been added." });
      if (result.flagged) {
        toast({
          title: "Take Flagged",
          description: `Your take was flagged for: ${result.reason || "Content policy review"}. It's still visible but may be reviewed.`,
          variant: "default",
          duration: 7000,
        });
      }
    } else {
      toast({ title: "Error Posting Take", description: result.error || "Could not post take.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleVote = async (takeId: string, voteType: "yes" | "no") => {
    setIsSubmitting(true); // Use isSubmitting to disable buttons during any async operation
    try {
      const takeRef = doc(db, "takes", takeId);
      await updateDoc(takeRef, {
        [`votes.${voteType}`]: increment(1)
      });
      setTakes(prevTakes =>
        prevTakes.map(t =>
          t.id === takeId ? { ...t, votes: { ...t.votes, [voteType]: t.votes[voteType] + 1 } } : t
        )
      );
      toast({ title: "Vote Cast!", description: `You voted '${voteType}'.` });
    } catch (error) {
      console.error("Error voting:", error);
      toast({ title: "Error", description: "Could not cast vote.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleAddComment = async (takeId: string, commentText: string) => {
    if (commentText.trim() === "") return;
    setIsSubmitting(true);
    try {
      const takeRef = doc(db, "takes", takeId);
      // Firestore security rules should validate commentText if needed
      await updateDoc(takeRef, {
        comments: arrayUnion(commentText)
      });
      setTakes(prevTakes =>
        prevTakes.map(t =>
          t.id === takeId ? { ...t, comments: [...t.comments, commentText] } : t
        )
      );
      toast({ title: "Comment Added!", description: "Your comment is live." });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({ title: "Error", description: "Could not add comment.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const sortedTakes = useMemo(() => {
    const newTakesArray = [...takes];
    switch (sortBy) {
      case "newest":
        return newTakesArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return newTakesArray.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "most_votes_total":
        return newTakesArray.sort((a, b) => (b.votes.yes + b.votes.no) - (a.votes.yes + a.votes.no));
      case "most_approved":
        return newTakesArray.sort((a, b) => b.votes.yes - a.votes.yes);
      case "most_disapproved":
        return newTakesArray.sort((a, b) => b.votes.no - a.votes.no);
      case "most_discussed":
        return newTakesArray.sort((a, b) => b.comments.length - a.comments.length);
      default:
        return newTakesArray;
    }
  }, [takes, sortBy]);

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-background font-body">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-headline font-bold text-primary mb-2">
          Clutch Takes
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Drop your hot takes. Vote. Debate.
        </p>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        <div className="p-6 bg-card shadow-xl rounded-xl border border-border">
          <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Post a New Take</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newTakeText}
              onChange={(e) => setNewTakeText(e.target.value)}
              placeholder="What's your controversial opinion...?"
              className="flex-grow text-base focus:border-primary shadow-sm"
              disabled={isSubmitting}
              onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleAddTake()}
            />
            <Button onClick={handleAddTake} disabled={isSubmitting || !newTakeText.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              {isSubmitting && !isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              Post Take
            </Button>
          </div>
        </div>
        
        <SortControls sortBy={sortBy} onSortChange={setSortBy} />

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : sortedTakes.length === 0 ? (
           <div className="text-center py-10">
             <Image src="https://placehold.co/300x200.png" alt="No takes yet" width={300} height={200} className="mx-auto mb-4 rounded-lg shadow-md" data-ai-hint="empty state basketball" />
            <p className="text-xl text-muted-foreground font-semibold">No takes here yet!</p>
            <p className="text-muted-foreground">Be the first to post a controversial opinion.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedTakes.map((take) => (
              <TakeCard 
                key={take.id} 
                take={take} 
                onVote={handleVote} 
                onAddComment={handleAddComment}
                isVotingDisabled={isSubmitting}
                isCommentingDisabled={isSubmitting}
              />
            ))}
          </div>
        )}
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Clutch Takes. All opinions are users' own.</p>
      </footer>
    </div>
  );
}
