
const Placeholder = ({ title }) => {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-gray-700 rounded-2xl bg-dark-card/50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-500">This feature is under development.</p>
      </div>
    </div>
  );
};

export default Placeholder;
