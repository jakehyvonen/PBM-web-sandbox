import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './../../styles.css'

class ReplayGestureDialogBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      rotation: '0',
      syringe: '0'
    };
  }

  open = () => {
    this.setState({ isOpen: true });
  }

  close = () => {
    this.setState({ isOpen: false });
  }

  handleSubmit = () => {
    const data = {
      rotation: this.state.rotation,
      syringe: this.state.syringe,
    }
    this.props.close(data);
  }

  render() {
    return (
      <Modal show={this.state.isOpen} onHide={this.close} className="gestureDiaBox">
        <Modal.Header closeButton>
          <Modal.Title>Select Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Insert your form fields here */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.close}>
            Close
          </Button>
          <Button variant="primary" onClick={this.handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ReplayGestureDialogBox;
