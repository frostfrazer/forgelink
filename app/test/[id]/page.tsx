export default function TestPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Dynamic Route Works!</h1>
      <p className="text-xl mt-4">ID from URL: {params.id}</p>
    </div>
  );
}