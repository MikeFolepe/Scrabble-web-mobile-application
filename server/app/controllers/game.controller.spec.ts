/* eslint-disable @typescript-eslint/no-require-imports */
import { Application } from '@app/app';
import { WordValidationService } from '@app/services/word-validation.service';
import * as chai from 'chai';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typedi';
import * as fileSystem from 'fs';
import chaiHttp = require('chai-http');
import Sinon = require('sinon');

describe('GameController', () => {
    let expressApp: Express.Application;
    let wordValidationService: WordValidationService;
    chai.use(chaiHttp);

    beforeEach(() => {
        const app = Container.get(Application);
        wordValidationService = Container.get<WordValidationService>(WordValidationService);
        expressApp = app.app;
    });

    it('should return the result of a validation from an invalid post request from the client', (done) => {
        const stubValidate = Sinon.stub(wordValidationService, 'isValidInDictionary').returns(false);
        chai.request(expressApp)
            .post('/api/game/validateWords/dictionary.json')
            .send(['mdmd', 'booo'])
            .end((err, response) => {
                expect(stubValidate.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.OK);
                expect(response.body).to.equal(false);
                stubValidate.restore();
                done();
            });
    });

    it('should return the result of a validation from a valid post request from the client', (done) => {
        const stubValidate = Sinon.stub(wordValidationService, 'isValidInDictionary').returns(true);
        chai.request(expressApp)
            .post('/api/game/validateWords/dictionary.json')
            .send(['sud', 'maman'])
            .end((err, response) => {
                expect(stubValidate.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.OK);
                expect(response.body).to.equal(true);
                stubValidate.restore();
                done();
            });
    });

    it('should return the dictionary asked by the client', (done) => {
        // fileSystem.readFileSync('./dictionaries/dictionary.json', 'utf8')).words;

        const jsonDictionary = `{
            "title": "Mon dictionnaire",
            "description": "Description de base",
            "words": [
                "aa",
                "aalenien",
                "aalenienne",
                "aaleniennes",
                "aaleniens"
            ]
        }`;
        const dictionary = JSON.parse(jsonDictionary);
        const stubOnParse = Sinon.stub(fileSystem, 'readFileSync').returns(jsonDictionary);

        chai.request(expressApp)
            .get('/api/game/dictionary/dictionary.json')
            .end((err, response) => {
                expect(stubOnParse.called).to.equal(true);
                expect(response.body).to.deep.equal(dictionary.words);
                expect(response.status).to.equal(StatusCodes.OK);
                stubOnParse.restore();
                done();
            });
    });
});
