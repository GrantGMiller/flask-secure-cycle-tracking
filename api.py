from flask import render_template, request, jsonify
from flask_dictabase import BaseTable
from flask_login_dictabase_blueprint import VerifyLogin, GetUser


class Blob(BaseTable):
    # data > str - base64 blob will be decoded by the client
    pass


def setup(app):
    @app.route('/api/blob/get')
    @VerifyLogin
    def api_get():
        # return the base64 blob
        user = GetUser()
        blob = app.db.NewOrFind(Blob, user_id=user['id'])
        print('blob=', blob)
        return jsonify(blob.get('data', ''))

    @app.post('/api/blob/post')
    @VerifyLogin
    def api_post():
        # save the blob
        # request.form.data should be a base64 string
        user = GetUser()
        blob = app.db.NewOrFind(Blob, user_id=user['id'])
        print('blob=', blob)

        if request.form and request.form.get('data', None):
            blob['data'] = request.form['data']
            print('34')
            return jsonify('The blob has been saved.')
        elif request.json:
            blob['data'] = request.json
            print('38')
            return jsonify('The blob has been saved.')
        else:
            return jsonify('No data was posted. Please include your data as a form encoded {"data": "{key:value}"} or as JSON in the body with a application/json header'), 500

    @app.route('/api/test')
    @VerifyLogin
    def api_test():
        return render_template('api_test.html')

    @app.route('/api/clear')
    @VerifyLogin
    def api_clear():
        # delete all data for this user
        user = GetUser()
        blob = app.db.NewOrFind(Blob, user_id=user['id'])
        app.db.Delete(blob)
        return 'deleted'
