"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, MoreVertical, Trash2, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    avatar_url?: string;
    full_name?: string;
    email: string;
  };
}

interface CommentsProps {
  songId: string;
  initialComments?: Comment[];
}

export function CommentsSection({ songId, initialComments = [] }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement with Supabase
      const comment = {
        id: Math.random().toString(),
        content: newComment,
        created_at: new Date().toISOString(),
        user: {
          id: "current-user",
          email: "user@example.com",
          avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&q=80",
        },
      };

      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      // TODO: Implement with Supabase
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId 
            ? { ...comment, content: newContent }
            : comment
        )
      );
      setEditingCommentId(null);
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // TODO: Implement with Supabase
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  // Generate a profile link for the comment author
  const getUserProfileLink = (user: Comment['user']) => {
    // For simplicity, we'll assume all comment authors are fans
    return `/profile/fan-1`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <MessageSquare className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Comments</h2>
        <span className="text-sm text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comment Input */}
      <div className="space-y-4">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Link href={getUserProfileLink(comment.user)}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.user.avatar_url} />
                <AvatarFallback>
                  {comment.user.full_name?.[0] || comment.user.email[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <Link 
                    href={getUserProfileLink(comment.user)}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {comment.user.full_name || comment.user.email}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => startEditing(comment)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment.id)}
                      className="gap-2 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {editingCommentId === comment.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCommentId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment.id, editContent)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2">{comment.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}