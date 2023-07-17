import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './../../styles.css'

class ReplayGestureDialogBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rotation: '0',
      syringe: '0'
    };
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
      <Modal show={this.props.isOpen} onHide={this.props.close} className="gestureDiaBox">
        <h1>Hello World</h1>
        <Modal.Header closeButton>
          <Modal.Title>Select Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Insert your form fields here */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.close}>
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
