import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client';
import { Container, Form, Button, Col, Row, InputGroup } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/theme.css'
import './options.css'
import optionsStorage from '../../utils/optionsStorage'
import { useTheme, applyTheme, ThemeValue } from '../../utils/theme'
const Popup: React.FC = () => {
    useTheme()
    const { register, setValue } = useForm();
    useEffect(() => {
        optionsStorage.syncForm('#formOptions');
    }, [])

    return (
        <Container>
            <Form id='formOptions' name='formOptions'>
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>{browser.i18n.getMessage('githubToken')}</Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <InputGroup size="sm">
                            <Form.Control name="githubToken" ref={register} type="text" placeholder="github token" size="sm" />
                            <InputGroup.Append>
                                <Button variant="outline-secondary" as="a" target="_blank" href="https://github.com/settings/tokens/new" size="sm">Get Token</Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>{browser.i18n.getMessage('gistID')}</Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <Form.Control name="gistID" ref={register} type="text" placeholder="gist ID" size="sm" />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>{browser.i18n.getMessage('gistFileName')}</Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <Form.Control name="gistFileName" ref={register} type="text" placeholder="gist file name" size="sm" />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>{browser.i18n.getMessage('enableNotifications')}</Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <Form.Check
                            id="enableNotify"
                            name="enableNotify"
                            ref={register}
                            type="switch"
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>Auto Sync</Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <Form.Check
                            id="autoSync"
                            name="autoSync"
                            ref={register}
                            type="switch"
                            title="Automatically upload on bookmark changes and download when remote changes are detected"
                            onChange={() => browser.runtime.sendMessage({ name: 'settingChanged' })}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>Check Interval (min)</Form.Label>
                    <Col sm={4} lg={3} xs={4}>
                        <Form.Control name="autoSyncInterval" ref={register} type="number" min="1" size="sm"
                            title="How often to check for remote changes (minutes)"
                            onChange={() => browser.runtime.sendMessage({ name: 'settingChanged' })}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>Theme</Form.Label>
                    <Col sm={4} lg={3} xs={4}>
                        <Form.Control as="select" name="theme" ref={register} size="sm"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                applyTheme(e.target.value as ThemeValue)
                            }>
                            <option value="system">System</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="black">Black (OLED)</option>
                        </Form.Control>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}></Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <a href="https://github.com/dudor/BookmarkHub" target="_blank">{browser.i18n.getMessage('help')}</a>
                    </Col>
                </Form.Group>
            </Form>
        </Container >
    )
}


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
  );
  