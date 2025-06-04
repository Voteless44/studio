export interface Comment {
  // Comments are stored as an array of strings for simplicity as per user code.
  // If richer comment objects are needed (e.g., author, timestamp), this type should be an object.
  // For now, this will represent the string content of a comment.
  text: string; 
  // If comments were objects:
  // id: string;
  // userId: string;
  // text: string;
  // createdAt: Date;
}

export interface Take {
  id: string;
  text: string;
  votes: {
    yes: number;
    no: number;
  };
  comments: string[]; // Array of comment strings
  createdAt: Date; // JS Date object for client-side use
  isFlagged?: boolean;
  flagReason?: string;
}
