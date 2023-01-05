import { trpc } from "~/utils/trpc";
import useStore from "~/utils/useStore";
import { type Todo } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import format from "date-fns/format";
import * as z from "zod";

interface TodoFormProps {
  todo?: Todo;
}

const schema = z.object({
  title: z.string().min(1, { message: "Required" }),
  date: z.string().optional(),
  time: z.string().optional(),
});

type TodoFormSchemaType = z.infer<typeof schema>;

const TodoForm: React.FC<TodoFormProps> = ({ todo }) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<TodoFormSchemaType>({
    resolver: zodResolver(schema),
  });

  const setEditModalIsOpen = useStore((state) => state.setEditModalIsOpen);
  const editModalIsOpen = useStore((state) => state.editModalIsOpen);

  const utils = trpc.useContext();
  const addTodo = trpc.todo.add.useMutation({
    async onSuccess() {
      await utils.todo.all.invalidate();
    },
  });

  if (todo) {
    const defaultValues: TodoFormSchemaType = {
      title: todo.title,
      date: format(todo.complete_by, "yyyy-MM-dd"),
      time: format(todo.complete_by, "HH:mm"),
    };
    reset({ ...defaultValues });
  }

  const onSubmit = async (data: TodoFormSchemaType) => {
    const input = {
      title: data.title,
      complete_by: new Date(`${data.date} ${data.time}`),
    };

    addTodo.mutate(input);
    if (editModalIsOpen) setEditModalIsOpen(false);
  };

  return (
    <>
      <form className="mb-2 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("title")}
          type="text"
          maxLength={255}
          placeholder="Title your todo..."
          className="mb-2 rounded-md bg-gray-200 py-1 px-2"
        />
        <div className="flex flex-row justify-around">
          <input
            {...register("date")}
            type="date"
            className="mb-2 rounded-md bg-gray-200 py-1 px-2"
            disabled={isSubmitting}
          />
          <input
            {...register("time")}
            type="time"
            className="mb-2 rounded-md bg-gray-200 py-1 px-2"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-row justify-around">
          <button
            type="reset"
            className="flex flex-row items-center justify-center rounded-md border-2 border-white bg-gray-400 px-4 py-2 align-middle text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            Reset
          </button>
          <button
            type="submit"
            className="flex flex-row items-center justify-center rounded-md border-2 border-white bg-blue-500 px-4 py-2 align-middle text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default TodoForm;
