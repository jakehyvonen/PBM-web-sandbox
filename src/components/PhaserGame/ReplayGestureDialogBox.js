import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import './../../styles.css'

class ReplayGestureDialogBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rotation: '0',
      syringe: '0',
      currentStep: 1, // added this state to keep track of the current form

    };
    console.log('DialogBox initialized'); // Will be logged when the component is initialized

  }

  nextStep = () => {
    const currentStep = this.state.currentStep;
    this.setState({ 
      currentStep: currentStep + 1,
      isOpen: true
    });
  }
  
  previousStep = () => {
    const currentStep = this.state.currentStep;
    if (currentStep > 1) {
      this.setState({ 
        currentStep: currentStep - 1,
        isOpen: true
      });
    }
  }
  
  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
}


  handleSubmit = () => {
    const data = {
      rotation: this.state.rotation,
      syringe: this.state.syringe,
    }
    this.props.close(data);
    this.setState({currentStep: 1});
  }

  render() {
    console.log('DialogBox rendered'); // Will be logged each time the component is rendered

    let currentForm;

    switch(this.state.currentStep) {
      case 1:
        currentForm = (
          <div>
            <Form>
              <Form.Label>Should we rotate?</Form.Label>
              <Form.Check 
                type="radio"
                label="90"
                name="rotationDegree"
                value="90"
                checked={this.state.rotationDegree === '90'}
                onChange={this.handleChange}
              />
              <Form.Check 
                type="radio"
                label="180"
                name="rotationDegree"
                value="180"
                checked={this.state.rotationDegree === '180'}
                onChange={this.handleChange}
              />
              <Form.Check 
                type="radio"
                label="270"
                name="rotationDegree"
                value="270"
                checked={this.state.rotationDegree === '270'}
                onChange={this.handleChange}
              />
            </Form>
          </div>
        );
        break;
      case 2:
        currentForm = (
          <div>
            <Form>
              <Form.Label>Should we swap syringes?</Form.Label>
              <Form.Check 
                type="radio"
                label="0"
                name="syringeNum"
                value="0"
                checked={this.state.syringeNum === '0'}
                onChange={this.handleChange}
              />
              <Form.Check 
                type="radio"
                label="1"
                name="syringeNum"
                value="1"
                checked={this.state.syringeNum === '1'}
                onChange={this.handleChange}
              />
              <Form.Check 
                type="radio"
                label="2"
                name="syringeNum"
                value="2"
                checked={this.state.syringeNum === '2'}
                onChange={this.handleChange}
              />
              <Form.Check 
                type="radio"
                label="3"
                name="syringeNum"
                value="3"
                checked={this.state.syringeNum === '3'}
                onChange={this.handleChange}
              />
            </Form>          
          </div>
        );
        break;
      default:
        currentForm = (
          <div>
            {<h1>how did we get here</h1>}
          </div>
        );
    }
    return (
      <Modal show={this.props.isOpen} onHide={this.props.close} className="gestureDiaBox">
        <Modal.Header closeButton>
          <Modal.Title>Select Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentForm}
        </Modal.Body>
        <Modal.Footer>
          {this.state.currentStep > 1 && (
            <Button variant="secondary" onClick={this.previousStep}>
              Previous
            </Button>
          )}
          {this.state.currentStep < 2 ? (
            <Button variant="primary" onClick={this.nextStep}>
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={this.handleSubmit}>
              Submit
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
    
  }
}

export default ReplayGestureDialogBox;

/*
return (
      <Modal show={this.props.isOpen} onHide={this.props.close} className="gestureDiaBox">
        <Modal.Header closeButton>
          <Modal.Title>Select Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form>
            <Form.Label>Should we rotate?</Form.Label>
            <Form.Check 
              type="radio"
              label="90"
              name="rotationDegree"
              value="90"
              checked={this.state.rotationDegree === '90'}
              onChange={this.handleChange}
            />
            <Form.Check 
              type="radio"
              label="180"
              name="rotationDegree"
              value="180"
              checked={this.state.rotationDegree === '180'}
              onChange={this.handleChange}
            />
            <Form.Check 
              type="radio"
              label="270"
              name="rotationDegree"
              value="270"
              checked={this.state.rotationDegree === '270'}
              onChange={this.handleChange}
            />
            <Form.Label>Should we swap syringes?</Form.Label>
            <Form.Check 
              type="radio"
              label="0"
              name="syringeNum"
              value="0"
              checked={this.state.syringeNum === '0'}
              onChange={this.handleChange}
            />
            <Form.Check 
              type="radio"
              label="1"
              name="syringeNum"
              value="1"
              checked={this.state.syringeNum === '1'}
              onChange={this.handleChange}
            />
            <Form.Check 
              type="radio"
              label="2"
              name="syringeNum"
              value="2"
              checked={this.state.syringeNum === '2'}
              onChange={this.handleChange}
            />
            <Form.Check 
              type="radio"
              label="3"
              name="syringeNum"
              value="3"
              checked={this.state.syringeNum === '3'}
              onChange={this.handleChange}
            />
          </Form>        </Modal.Body>
        <Modal.Footer>
          
          <Button variant="primary" onClick={this.handleSubmit}>
            Replay Gesture
          </Button>
        </Modal.Footer>
      </Modal>
    );
    */