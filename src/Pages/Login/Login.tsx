import { Form, Row } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.scss'
import { UserContext } from '../../context/user';
import { useNavigate } from 'react-router-dom';

export default function Login() {

    const { user, signIn, err, setErr, signOut }: any = useContext(UserContext)
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
      });

    const handleChange = (target: any, value: any) => {
        setForm({...form,[target]:value})
    }   

    const handleSingIn = async (email: string, password: string) => {
        signIn(email, password)
        
    }

    useEffect(() => {
        if (user) {
            /* navigate("/schedule")  */
            setErr(!err)
        }
    }, [user])

    const wrong = (err : boolean) =>{ if (err) {
        return <p>Wrong email or password</p>
        
    }}
  return (
    <>
        <div className='containerBg'>
            <div className="mt-3 mb-3 form">
                <Row>
                    <h2>BARBER CONNECT</h2>
                </Row>
                <Row>
                    <span>{wrong(Boolean(err))}</span>
                </Row>
                <Row className="mb-3 d-flex justify-content-center">
                    <Form.Group controlId="formBasicEmail" className="col-8 col-sm-8">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={form.email} onChange={(e) => handleChange(e.target.name, e.target.value)} className="form-control" />
                    </Form.Group>
                    <Form.Group controlId="formBasicPassword" className="col-8 col-sm-8 mt-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" value={form.password} onChange={(e) => handleChange(e.target.name, e.target.value)} className="form-control" />
                    </Form.Group>
                </Row>
                <Row className="mb-6 d-flex justify-content-center">
                    <Form.Group controlId="formGridCheckbox" className="col col-sm-6 d-flex justify-content-center ">
                        <button 
                            accessKey="enter"
                            type="submit" 
                            className="me-6 btn btn-primary btn-lg btn-block "
                            onClick={() => {handleSingIn(form.email as any, form.password as any)}}
                            >
                                Login
                        </button>
                    </Form.Group>
                </Row>
            </div>
        </div>
    </>
  )
}
