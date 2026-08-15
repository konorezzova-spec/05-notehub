//npm install use-debounce
//npm install react-hot-toast
import { useEffect, useState } from "react";
import NoteList from "../NoteList/NoteList";
import Pagination from "../Pagination/Pagination";
import { fetchNotes } from "../../services/noteService";
import css from "./App.module.css";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import Modal from "../Modal/Modal";
import SearchBox from "../SearchBox/SearchBox";
import { useDebounce } from "use-debounce";
import { Toaster, toast } from "react-hot-toast";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, error, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["notes", debouncedQuery, currentPage],
    queryFn: () =>
      fetchNotes({ search: debouncedQuery, page: currentPage, perPage: 12 }),
    enabled: true,
    retry: 1,
    placeholderData: keepPreviousData,
  });

  const updateSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = data?.totalPages ?? 0;

  useEffect(() => {
    if (data && data.notes.length === 0) {
      toast.error("No notes found.");
    }
  }, [data]);

  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  const dropPage = () => {
    setCurrentPage(1);
    setSearchQuery("");
  };
  return (
    <>
      <div className={css.app}>
        <header className={css.toolbar}>
          <SearchBox value={searchQuery} onChange={updateSearchQuery} />

          {isSuccess && totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
          <button type="button" className={css.button} onClick={openModal}>
            Create note +
          </button>
        </header>

        {isLoading && <Loader />}
        {isError && <ErrorMessage message={error.message} />}

        {data && data.notes.length > 0 && <NoteList notes={data.notes} />}

        <Toaster />

        {modalOpen && <Modal onClose={closeModal} dropPage={dropPage} />}
      </div>
    </>
  );
}

export default App;
