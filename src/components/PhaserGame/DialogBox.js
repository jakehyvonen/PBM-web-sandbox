import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class DialogBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  open() {
    this.setState({ isOpen: true });
  }

  close() {
    this.setState({ isOpen: false });
  }

  render() {
    return (
      <Modal show={this.state.isOpen} onHide={() => this.close()}>
        <Modal.Header closeButton>
          <Modal.Title>Select Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Insert your form fields here */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.close()}>
            Close
          </Button>
          <Button variant="primary" onClick={() => this.close()}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DialogBox;
