import AddFriendButton from "@/components/AddFriendButton";

type Props = {}

const Component = ({}: Props) => {
  return (
    <section className="pt-8">
      <h2 className="font-bold text-5xl mb-8">Add a friend</h2>
      <AddFriendButton />
    </section>
  );
}

export default Component