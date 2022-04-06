import {createModalAdapter} from 'react-modal-helper';
import Modal from 'react-modal'; //<-- using react-modal here but you could use any modal component of your choice

// create an adapter to render any modal implementation of your choice
export const ModalAdapter = createModalAdapter(({isOpen, children}) => (
  <Modal isOpen={isOpen} ariaHideApp={false}>
    {children}
  </Modal>
));