import React, { Component } from 'react';
import './styles.css';
import { Card, CardBody, CardTitle, CardSubtitle, Row, Col, Button, Input, Form, FormGroup, Alert } from 'reactstrap';
import { withCookies } from 'react-cookie';
import { withRouter } from 'react-router-dom';
import { startCase } from 'lodash';
import moment from 'moment';
import Countdown from 'react-countdown-now';

const fileDownload = require('js-file-download');

const fetchAuthenticated = (url, token, method, body) =>
  fetch(url, {
    method: method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*"
    },
    body,
  })

class App extends Component {
  constructor(){
    super();
    this.state = {
      questionsAttempted:{

      }
    }
    this.selectFileToUpload = this.selectFileToUpload.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
  }

  componentWillMount() {
    const token = this.props.cookies.get('token');
    fetchAuthenticated('http://52.157.232.213:8080/questions/', token)
    .then((res) => res.json())
    .then((questions) => {
      console.log(questions)
      this.setState({
        questions,
      })
    });
  }

  selectFileToUpload = (e) => {
    var data = new FormData()
    data.append('file', e.target.files[0])
    this.setState({
      fileToUpload: data,
    })
  }
  
  uploadFile = (questionName) => () => {
    const { fileToUpload } = this.state;
    const token = this.props.cookies.get('token');
    fetch('http://52.157.232.213:8080/submissions/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Access-Control-Allow-Origin': "*"
      },
      body: fileToUpload
    })
    .then((res) => res.json())
    .then((res) => {
      this.setState({
        questionsAttempted:{
          [questionName]: false,
        },
        submission: res
      })
    })
  }

  getSmallTestSet = (questionName) => () => {
    const token = this.props.cookies.get('token');
    fetchAuthenticated(`http://52.157.232.213:8080/questions/${questionName}/small-set`, token)
    .then((res) => res.text())
    .then((questions) => {
      fileDownload(questions, `${questionName}_small_${moment().valueOf()}`)
      this.setState({
        questionsAttempted:{
          [questionName]: true,
        }
      })
    });
  }

  getLargeTestSet = (questionName) => () => {
    const token = this.props.cookies.get('token');
    fetchAuthenticated(`http://52.157.232.213:8080/questions/${questionName}/large-set`, token)
    .then((res) => res.text())
    .then((questions) => {
      fileDownload(questions, `${questionName}_large_${moment().valueOf()}`)
      this.setState({
        questionsAttempted:{
          [questionName]: true,
        }
      })
    });
  }

  render() {
    const { questions, questionsAttempted, fileToUpload, submission } = this.state;
    return (
      <div>
        <h3 className="text-center">Questions</h3>
        <p>
          Trying to solve a problem provided by the <Button outline disabled size="sm">Trial Set</Button> button <strong className="text-success">will not</strong> impact your submissions
          <br/>
          <br/>
          Trying to solve a problem provided by the <Button outline disabled size="sm">Submission Set</Button> button <strong className="text-danger">will</strong> impact your submissions
        </p>
        <Row>
          {
            questions && questions.map(question => (
              <Col xs="12" md="6">
                <Card className="Question-card">
                  <CardBody>
                    <CardTitle className="text-center">{startCase(question.name)}</CardTitle>
                    {
                      questionsAttempted[question.name] ? (
                        <div>
                          <CardSubtitle className="Question_Subtitle text-center">Time Remaining <Countdown onComplete={() => this.setState({
                            questionsAttempted:{
                              [question.name]: false,
                            }
                          })} date={Date.now() + (question.timeLimit * 1000)} /> </CardSubtitle>
                        </div>
                      ) : (
                        <CardSubtitle className="Question_Subtitle text-center">Time limit <span className="text-primary">{question.timeLimit}</span> seconds</CardSubtitle>
                      )
                    }
                    <div>
                      <Button outline color="warning" className="float-left" onClick={this.getSmallTestSet(question.name)}>Trial Set</Button>
                      <Button outline color="success" className="float-right" onClick={this.getLargeTestSet(question.name)}>Submission Set</Button>
                    </div>
                    {
                      questionsAttempted[question.name] && (  
                        <Form className="Question-submission-form">
                          <h6 className="text-center text-secondary">Upload Submission</h6>
                          <FormGroup>
                            <Input
                              type="file"
                              name="file"
                              id="file"
                              onChange={this.selectFileToUpload}
                            />
                          </FormGroup>
                          <Button disabled={!fileToUpload} color="primary" onClick={this.uploadFile(question.name)}>Submit</Button>
                        </Form> 
                      )
                    }               
                  </CardBody>
                </Card>
              </Col>
            ))
          }
        </Row>
        {
          submission && submission.successful === true && (
            <Alert color="success">
              {submission.message}
            </Alert>
          )
        }
        {
          submission && submission.successful === false && (
            <Alert color="danger">
              {submission.message}
            </Alert>
          )
        }
        {
          submission && submission.successful === undefined && (
            <Alert color="dark">
              {submission.message}
            </Alert>
          )
        }

      </div>
    );
  }
}

export default withRouter(withCookies(App));
