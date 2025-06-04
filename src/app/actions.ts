// This file uses server-side code.
'use server';

import { moderateTake, type ModerateTakeInput } from '@/ai/flows/moderate-take';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Take } from '@/types';

export interface SubmitTakeResult {
  success: boolean;
  take?: Take;
  error?: string;
  flagged?: boolean;
  reason?: string;
}

export async function submitTakeAction(takeText: string): Promise<SubmitTakeResult> {
  if (!takeText.trim()) {
    return { success: false, error: 'Take cannot be empty.' };
  }

  try {
    const moderationInput: ModerateTakeInput = { text: takeText };
    const moderationResult = await moderateTake(moderationInput);

    const newTakeData = {
      text: takeText,
      votes: { yes: 0, no: 0 },
      comments: [],
      createdAt: serverTimestamp(), // Firestore server-side timestamp
      isFlagged: moderationResult.flagForReview,
      flagReason: moderationResult.reason || '',
    };

    const docRef = await addDoc(collection(db, 'takes'), newTakeData);
    
    // For optimistic update, we return data that resembles a Take object.
    // The `createdAt` will be a client-side approximation.
    return {
      success: true,
      take: {
        id: docRef.id,
        text: newTakeData.text,
        votes: newTakeData.votes,
        comments: newTakeData.comments,
        createdAt: new Date(), // Client-side approximation of timestamp
        isFlagged: newTakeData.isFlagged,
        flagReason: newTakeData.flagReason,
      },
      flagged: newTakeData.isFlagged,
      reason: newTakeData.flagReason,
    };

  } catch (error) {
    console.error("Error submitting take:", error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to submit take. ${errorMessage}` };
  }
}
