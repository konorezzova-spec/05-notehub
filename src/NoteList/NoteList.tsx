// npm install @tanstack/react-query

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "../types/note";
import css from "./NoteList.module.css";
import { deleteNote } from "../services/noteService";

interface NoteListProps {
  notes: Note[];
}
export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteNote,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // queryClient.setQueryData<Note[]>(["notes"], (prevNotes) => {
      //   if (!prevNotes) {
      //     return [];
      //   }
      //   return prevNotes.filter((note) => note.id !== deletedTask.id);
      // });
    },
    onError() {
      alert("Error happened!");
    },
  });
  return (
    <>
      <ul className={css.list}>
        {notes.map(note => (
          <li key={note.id} className={css.listItem}>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>
              <button
                type="button"
                className={css.button}
                onClick={() => {
                  deleteMutate(note.id);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
