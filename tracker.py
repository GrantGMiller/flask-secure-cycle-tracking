from flask import render_template
from flask_login_dictabase_blueprint import VerifyLogin
from flask_login_dictabase_blueprint.menu import GetMenu
import config


BUTTONS = [
        {'id': 0, 'text': 'Had Sex'},
        {'id': 1, 'text': 'Had Bleeding'},
        {'id': 2, 'text': 'Had Cramping'},
        {'id': 3, 'text': 'Positive Pregnancy Test'},
        {'id': 4, 'text': 'Negative Pregnancy Test'},
    ]


def setup(app):
    @app.route('/tracker')
    @VerifyLogin
    def app():
        return render_template(
            'tracker.html',
            menuOptions=GetMenu(),
            buttons=BUTTONS,
        )
