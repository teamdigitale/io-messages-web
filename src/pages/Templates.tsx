import React, { Component } from "react";

import { withRouter } from "react-router";
import { withNamespaces } from "react-i18next";
import { withDB, Find } from "react-pouchdb/browser";

import { Link } from "react-router-dom";

import { Button } from "design-react-kit";

import SelectedService from "../components/SelectedService";
import TemplatesList from "../components/templates/TemplatesList";
import TemplatesEditor from "../components/templates/TemplatesEditor";

import compose from "recompose/compose";

import { LIMITS } from "../utils/constants";
import { isLengthValid } from "../utils/validators";
const { SUBJECT, MARKDOWN } = LIMITS;

import "./Pages.css";

type TemplatesState = { subject: string, markdown: string, doc: any } & {
  subject: any,
  markdown: any,
  doc: any
} & any & { subject: string, markdown: string, doc: any };

class Templates extends Component<any, TemplatesState> {
  initialState: TemplatesState = {
    subject: "",
    markdown: "",
    doc: undefined
  };

  state = {
    subject: this.initialState.subject,
    markdown: this.initialState.markdown,
    doc: this.initialState.doc
  };

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: { template_id }
      }
    } = nextProps;

    if (template_id !== this.props.match.params.template_id) {
      if (!template_id || template_id === "new") {
        this.setState({
          subject: this.initialState.subject,
          markdown: this.initialState.markdown,
          doc: this.initialState.doc
        });
      } else {
        const { db }: any = this.props;

        (async () => {
          const messages = await db.find({
            selector: { type: "template", _id: template_id }
          });

          const message = messages.docs[0];

          const { subject, markdown } = message;
          this.setState({
            subject,
            markdown,
            doc: message
          });
        })();
      }
    }
  }

  onChangeSubject = ({ target: { value } }) => {
    this.setState({
      subject: value
    });
  };

  onChangeMarkdown = ({ target: { value } }) => {
    this.setState({
      markdown: value
    });
  };

  onSaveTemplate = () => {
    const { subject, markdown, doc } = this.state;

    const {
      db,
      match: {
        params: { template_id }
      }
    }: any = this.props;

    if (template_id && template_id !== "new") {
      db.put({
        ...doc,
        subject,
        markdown
      }).then(() => {
        this.goBack();
      });
    } else {
      db.post({
        type: "template",
        subject,
        markdown
      }).then(() => {
        this.goBack();
      });
    }
  };

  goBack = () => {
    const { history }: any = this.props;
    const location = {
      pathname: "/templates"
    };
    history.push(location);
  };
  render() {
    const { subject, markdown } = this.state;
    const {
      match: {
        params: { template_id }
      }
    }: any = this.props;
    const { t }: any = this.props;

    const isSubjectValid = isLengthValid(subject, [SUBJECT.MIN, SUBJECT.MAX]);
    const isMarkdownValid = isLengthValid(markdown, [
      MARKDOWN.MIN,
      MARKDOWN.MAX
    ]);

    return (
      <section className="pages--container">
        <SelectedService />
        {(() => {
          if (!template_id) {
            return (
              <div>
                <div className="d-flex justify-content-end">
                  <Link
                    className="btn btn-primary mb-3"
                    to={{ pathname: "templates/new" }}
                  >
                    {t("add")}
                  </Link>
                </div>

                <Find
                  selector={{
                    type: "template"
                  }}
                  sort={["_id"]}
                  render={({ docs }) => <TemplatesList docs={docs} />}
                />
              </div>
            );
          }

          return (
            <section className="h-100">
              <TemplatesEditor
                subject={subject}
                markdown={markdown}
                subjectLength={[SUBJECT.MIN, SUBJECT.MAX]}
                markdownLength={[MARKDOWN.MIN, MARKDOWN.MAX]}
                isSubjectValid={isSubjectValid}
                isMarkdownValid={isMarkdownValid}
                onChangeSubject={this.onChangeSubject}
                onChangeMarkdown={this.onChangeMarkdown}
              />

              <Button
                className="mt-5"
                block
                color="primary"
                disabled={[isSubjectValid, isMarkdownValid].includes(false)}
                onClick={this.onSaveTemplate}
              >
                {t("save")}
              </Button>
            </section>
          );
        })()}
      </section>
    );
  }
}

const enhance = compose(
  withDB,
  withRouter,
  withNamespaces("template")
);

export default enhance(Templates);