//  npm install formik --save
//  npm install yup
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import css from "./NoteForm.module.css";
import { useId } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../services/noteService";

// Спочатку створюємо інтерфейс, який описує об'єкт початкових значень:
interface NoteFormValues {
  title: string;
  content: string;
  tag: "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";
}
//Виносимо об'єкт початкових значень у зовнішню змінну і типізуємо.
const initialValues: NoteFormValues = {
  title: "",
  content: "",
  tag: "Todo",
};
//Створимо схему валідації блоку "Client Info" з полями title, content та tag. Для цього використаємо Yup.object().shape(), в який передамо об'єкт з правилами валідації для кожного поля.
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Name too short")
    .max(50, "Name too long")
    .required("Name is required"),
  content: Yup.string()
    .max(500, "Content too long")
    .required("Content is required"),
  tag: Yup.string()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"], "Invalid tag")
    .required("Tag is required"),
});

interface NoteFormProps {
  onClose: () => void;
  dropPage: () => void;
}

export default function NoteForm({ onClose, dropPage }: NoteFormProps) {
  const fieldId = useId();
  const queryClient = useQueryClient();

  const { mutate: createMutate } = useMutation({
    mutationFn: createNote,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onClose();
      dropPage();
    },
    onError() {
      alert("Error happened!");
    },
  });

  const handleSubmit = (
    values: NoteFormValues,
    actions: FormikHelpers<NoteFormValues>
  ) => {
    createMutate(values);
    actions.resetForm();
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      //Підключаємо схему до Formik через пропс validationSchema, в який треба передати схему валідації Yup.
      validationSchema={validationSchema}
    >
      {({ isValid, dirty }) => {
        return (
          <Form className={css.form}>
            <div className={css.formGroup}>
              <label htmlFor={`${fieldId}-title`}>Title</label>
              <Field
                id={`${fieldId}-title`}
                type="text"
                name="title"
                className={css.input}
              />
              <ErrorMessage name="title" className={css.error} />
            </div>

            <div className={css.formGroup}>
              <label htmlFor={`${fieldId}-content`}>Content</label>
              <Field
                as="textarea"
                id={`${fieldId}-content`}
                name="content"
                rows={8}
                className={css.textarea}
              />
              <ErrorMessage name="content" className={css.error} />
            </div>

            <div className={css.formGroup}>
              <label htmlFor={`${fieldId}-tag`}>Tag</label>
              <Field
                as="select"
                id={`${fieldId}-tag`}
                name="tag"
                className={css.select}
              >
                <option value="Todo">Todo</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Meeting">Meeting</option>
                <option value="Shopping">Shopping</option>
              </Field>
              <ErrorMessage name="tag" className={css.error} />
            </div>

            <div className={css.actions}>
              <button
                type="button"
                className={css.cancelButton}
                onClick={onClose}
                aria-label="Close modal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={css.submitButton}
                disabled={!isValid || !dirty}
              >
                Create note
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
