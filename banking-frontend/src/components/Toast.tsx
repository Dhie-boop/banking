import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Toast() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      className="mt-16"
      toastClassName="bg-white border border-gray-200 text-gray-900 rounded-lg shadow-lg text-sm"
      progressClassName="bg-blue-800"
    />
  );
}
